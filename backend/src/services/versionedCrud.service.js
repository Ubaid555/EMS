import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { paginateQuery } from "../utils/queryHelper.js";

/**
 * =========================================================================
 * Universal SCD Type 2 Audit & Versioning CRUD Engine
 * =========================================================================
 * Handles atomic version chaining, active-state deactivation, root-record
 * tracking for multi-entity items, and chronological timeline generation.
 *
 * Atomicity Guarantees:
 * 1. Pre-emptive Conflict Checking: Inspects unique schema indexes to catch
 *    duplicate collisions before modifying existing records.
 * 2. Mongoose ACID Transactions: Automatically initiates multi-document sessions
 *    when running on a Replica Set (Atlas, staging, local rs0).
 * 3. Compensation Rollback Pattern: When running on a standalone MongoDB deployment,
 *    automatically compensates on failure by restoring previous active state,
 *    preventing accidental record deactivations.
 */

/**
 * Detects whether the current Mongoose MongoDB connection supports multi-document transactions.
 * Multi-document transactions require a replica set member or mongos router.
 */
export const supportsTransactions = () => {
  try {
    const client = mongoose.connection.getClient();
    const description = client?.topology?.description;
    if (!description) return false;
    const type = description.type;
    return (
      type === "ReplicaSetWithPrimary" ||
      type === "ReplicaSetNoPrimary" ||
      type === "Sharded" ||
      Boolean(description.setName)
    );
  } catch {
    return false;
  }
};

/**
 * Pre-emptively inspects schema unique partial indexes for collisions on active records.
 * Throws 409 Conflict before modifying any existing database documents.
 */
export const checkUniquenessConflict = async (Model, employeeId, payload, excludeId = null) => {
  const indexes = Model.schema?.indexes?.() || [];
  for (const [indexFields, options] of indexes) {
    if (options?.unique && options?.partialFilterExpression?.isCurrent === true) {
      const query = { employeeId, isCurrent: true, isDeleted: false };
      let hasIndexedFieldInPayload = false;

      for (const key of Object.keys(indexFields)) {
        if (key === "employeeId" || key === "isCurrent" || key === "isDeleted") continue;
        if (payload[key] !== undefined && payload[key] !== null) {
          query[key] = payload[key];
          hasIndexedFieldInPayload = true;
        }
      }

      if (hasIndexedFieldInPayload) {
        if (excludeId) {
          query._id = { $ne: excludeId };
        }
        const conflict = await Model.findOne(query).lean();
        if (conflict) {
          const conflictingKeys = Object.keys(query).filter(
            (k) => !["employeeId", "isCurrent", "isDeleted", "_id"].includes(k)
          );
          const fieldsStr = conflictingKeys.join(", ");
          throw new ApiError(
            409,
            `An active record with matching '${fieldsStr}' already exists for this employee.`
          );
        }
      }
    }
  }
};

/**
 * Executes an atomic SCD Type 2 state transition (deactivate current -> insert new version/tombstone).
 * Uses native MongoDB ACID multi-document transactions when running on a Replica Set (Atlas/cluster).
 * Automatically falls back to atomic Compensation Rollback on standalone MongoDB instances,
 * ensuring zero data loss if validation or unique constraint errors occur.
 */
export const executeVersionTransition = async ({ Model, current, newRecordData }) => {
  const useTransaction = supportsTransactions();

  if (useTransaction) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      // 1. Deactivate old version inside session
      await Model.findByIdAndUpdate(
        current._id,
        { $set: { isCurrent: false } },
        { session }
      );

      // 2. Insert new version inside session
      const [created] = await Model.create([newRecordData], { session });

      await session.commitTransaction();
      return created;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  } else {
    // Standalone / Single topology: Compensation Rollback Pattern
    let deactivated = false;
    try {
      // 1. Deactivate old version
      await Model.findByIdAndUpdate(current._id, {
        $set: { isCurrent: false },
      });
      deactivated = true;

      // 2. Insert new version
      const created = await Model.create(newRecordData);
      return created;
    } catch (error) {
      // Compensation Rollback: Restore previous active status if insert fails
      if (deactivated) {
        await Model.findByIdAndUpdate(current._id, {
          $set: { isCurrent: true },
        }).catch((compErr) => {
          console.error("❌ Critical: Compensation rollback failed to restore record:", compErr);
        });
      }
      throw error;
    }
  }
};

// -------------------------------------------------------------------------
// 1. SINGLE-ENTITY FORMS (Basic Info, CNIC, Addresses)
// -------------------------------------------------------------------------

/**
 * Fetch current active single-entity record (or null if not yet created)
 */
export const getSingleActive = async (Model, employeeId) => {
  return await Model.findOne({
    employeeId,
    isCurrent: true,
    isDeleted: false,
  }).lean();
};

/**
 * Save or Update a single-entity record with automatic version chaining
 */
export const saveSingle = async (Model, employeeId, payload, changedBy) => {
  const current = await Model.findOne({
    employeeId,
    isCurrent: true,
    isDeleted: false,
  });

  if (current) {
    // Pre-emptively verify uniqueness against other documents if applicable
    await checkUniquenessConflict(Model, employeeId, payload, current._id);

    const newRecordData = {
      ...payload,
      employeeId,
      version: current.version + 1,
      isCurrent: true,
      isDeleted: false,
      previousRecord: current._id,
      actionType: "UPDATE",
      changedBy,
      effectiveDate: new Date(),
    };

    return await executeVersionTransition({ Model, current, newRecordData });
  }

  // Initial creation (Version 1)
  await checkUniquenessConflict(Model, employeeId, payload);

  const initialRecord = await Model.create({
    ...payload,
    employeeId,
    version: 1,
    isCurrent: true,
    isDeleted: false,
    previousRecord: null,
    actionType: "CREATE",
    changedBy,
    effectiveDate: new Date(),
  });

  return initialRecord;
};

/**
 * Soft-delete a single-entity record with an audit tombstone
 */
export const deleteSingle = async (Model, employeeId, changedBy) => {
  const current = await Model.findOne({
    employeeId,
    isCurrent: true,
    isDeleted: false,
  });

  if (!current) {
    throw new ApiError(404, "Active record not found to delete.");
  }

  const tombstoneData = {
    ...current.toObject(),
    _id: undefined,
    version: current.version + 1,
    isCurrent: false,
    isDeleted: true,
    previousRecord: current._id,
    actionType: "DELETE",
    changedBy,
    effectiveDate: new Date(),
  };

  return await executeVersionTransition({
    Model,
    current,
    newRecordData: tombstoneData,
  });
};

/**
 * Retrieve chronological audit history for a single-entity record (paginated & searchable)
 */
export const getSingleHistory = async (
  Model,
  employeeId,
  queryParams = {},
  options = {}
) => {
  const baseFilter = { employeeId };

  return await paginateQuery(Model, baseFilter, queryParams, {
    defaultSortBy: "version",
    defaultSortOrder: "desc",
    populate: {
      path: "changedBy",
      select: "credentials.role credentials.subCategory credentials.assignedNumber credentials.email",
    },
    ...options,
  });
};

// -------------------------------------------------------------------------
// 2. MULTI-ENTITY FORMS (Languages, Education, Contacts, etc.)
// -------------------------------------------------------------------------

/**
 * Fetch all currently active items for an employee (paginated & searchable)
 */
export const getMultiActive = async (
  Model,
  employeeId,
  queryParams = {},
  options = {}
) => {
  const baseFilter = {
    employeeId,
    isCurrent: true,
    isDeleted: false,
    ...(options.baseFilter || {}),
  };

  return await paginateQuery(Model, baseFilter, queryParams, {
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    ...options,
  });
};

/**
 * Add a new item to an employee's multi-entity collection (e.g. add new language)
 */
export const createMulti = async (Model, employeeId, payload, changedBy) => {
  await checkUniquenessConflict(Model, employeeId, payload);

  const newItem = new Model({
    ...payload,
    employeeId,
    version: 1,
    isCurrent: true,
    isDeleted: false,
    previousRecord: null,
    actionType: "CREATE",
    changedBy,
    effectiveDate: new Date(),
  });

  // On creation, rootRecordId links to its own ID to group all future versions of this item
  newItem.rootRecordId = newItem._id;
  await newItem.save();

  return newItem;
};

/**
 * Update a specific item without touching any other items in the collection
 */
export const updateMulti = async (Model, employeeId, itemId, payload, changedBy) => {
  const current = await Model.findOne({
    _id: itemId,
    employeeId,
    isCurrent: true,
    isDeleted: false,
  });

  if (!current) {
    throw new ApiError(404, "Active item not found to update.");
  }

  // Pre-emptively verify uniqueness against other active items in the collection
  await checkUniquenessConflict(Model, employeeId, payload, current._id);

  const newRecordData = {
    ...payload,
    employeeId,
    rootRecordId: current.rootRecordId || current._id,
    version: current.version + 1,
    isCurrent: true,
    isDeleted: false,
    previousRecord: current._id,
    actionType: "UPDATE",
    changedBy,
    effectiveDate: new Date(),
  };

  return await executeVersionTransition({ Model, current, newRecordData });
};

/**
 * Soft-delete a specific item from a multi-entity collection
 */
export const deleteMulti = async (Model, employeeId, itemId, changedBy) => {
  const current = await Model.findOne({
    _id: itemId,
    employeeId,
    isCurrent: true,
    isDeleted: false,
  });

  if (!current) {
    throw new ApiError(404, "Active item not found to delete.");
  }

  const tombstoneData = {
    ...current.toObject(),
    _id: undefined,
    rootRecordId: current.rootRecordId || current._id,
    version: current.version + 1,
    isCurrent: false,
    isDeleted: true,
    previousRecord: current._id,
    actionType: "DELETE",
    changedBy,
    effectiveDate: new Date(),
  };

  return await executeVersionTransition({
    Model,
    current,
    newRecordData: tombstoneData,
  });
};

/**
 * Retrieve version history of a single item (e.g. English V1 -> V2) (paginated & searchable)
 */
export const getMultiItemHistory = async (
  Model,
  employeeId,
  itemIdOrRootId,
  queryParams = {},
  options = {}
) => {
  const refItem = await Model.findById(itemIdOrRootId);
  const rootId = refItem?.rootRecordId || itemIdOrRootId;

  const baseFilter = {
    employeeId,
    rootRecordId: rootId,
    ...(options.baseFilter || {}),
  };

  return await paginateQuery(Model, baseFilter, queryParams, {
    defaultSortBy: "version",
    defaultSortOrder: "desc",
    populate: {
      path: "changedBy",
      select: "credentials.role credentials.subCategory credentials.assignedNumber credentials.email",
    },
    ...options,
  });
};

/**
 * Retrieve the full chronological audit history of all actions in this collection (paginated & searchable)
 */
export const getMultiAllHistory = async (
  Model,
  employeeId,
  queryParams = {},
  options = {}
) => {
  const baseFilter = {
    employeeId,
    ...(options.baseFilter || {}),
  };

  return await paginateQuery(Model, baseFilter, queryParams, {
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    populate: {
      path: "changedBy",
      select: "credentials.role credentials.subCategory credentials.assignedNumber credentials.email",
    },
    ...options,
  });
};

export default {
  getSingleActive,
  saveSingle,
  deleteSingle,
  getSingleHistory,
  getMultiActive,
  createMulti,
  updateMulti,
  deleteMulti,
  getMultiItemHistory,
  getMultiAllHistory,
};
