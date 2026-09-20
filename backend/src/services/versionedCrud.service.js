import ApiError from "../utils/ApiError.js";

/**
 * =========================================================================
 * Universal SCD Type 2 Audit & Versioning CRUD Engine
 * =========================================================================
 * Handles atomic version chaining, active-state deactivation, root-record
 * tracking for multi-entity items, and chronological timeline generation.
 */

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
    // 1. Mark existing version as historical
    await Model.findByIdAndUpdate(current._id, {
      $set: { isCurrent: false },
    });

    // 2. Insert new version pointing to previous
    const updatedRecord = await Model.create({
      ...payload,
      employeeId,
      version: current.version + 1,
      isCurrent: true,
      isDeleted: false,
      previousRecord: current._id,
      actionType: "UPDATE",
      changedBy,
      effectiveDate: new Date(),
    });

    return updatedRecord;
  }

  // Initial creation (Version 1)
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

  // Deactivate current
  await Model.findByIdAndUpdate(current._id, {
    $set: { isCurrent: false },
  });

  // Create audit tombstone
  const tombstone = await Model.create({
    ...current.toObject(),
    _id: undefined,
    version: current.version + 1,
    isCurrent: false,
    isDeleted: true,
    previousRecord: current._id,
    actionType: "DELETE",
    changedBy,
    effectiveDate: new Date(),
  });

  return tombstone;
};

/**
 * Retrieve chronological audit history for a single-entity record
 */
export const getSingleHistory = async (Model, employeeId) => {
  return await Model.find({ employeeId })
    .sort({ version: -1 })
    .populate("changedBy", "credentials.email")
    .lean();
};

// -------------------------------------------------------------------------
// 2. MULTI-ENTITY FORMS (Languages, Education, Contacts, etc.)
// -------------------------------------------------------------------------

/**
 * Fetch all currently active items for an employee (e.g. all active languages)
 */
export const getMultiActive = async (Model, employeeId) => {
  return await Model.find({
    employeeId,
    isCurrent: true,
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Add a new item to an employee's multi-entity collection (e.g. add new language)
 */
export const createMulti = async (Model, employeeId, payload, changedBy) => {
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

  // 1. Mark existing item as historical
  await Model.findByIdAndUpdate(current._id, {
    $set: { isCurrent: false },
  });

  // 2. Insert new version pointing to previous and preserving rootRecordId
  const updatedItem = await Model.create({
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
  });

  return updatedItem;
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

  // Deactivate current
  await Model.findByIdAndUpdate(current._id, {
    $set: { isCurrent: false },
  });

  // Create audit tombstone for this item
  const tombstone = await Model.create({
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
  });

  return tombstone;
};

/**
 * Retrieve version history of a single item (e.g. English V1 -> V2)
 */
export const getMultiItemHistory = async (Model, employeeId, itemIdOrRootId) => {
  const refItem = await Model.findById(itemIdOrRootId);
  const rootId = refItem?.rootRecordId || itemIdOrRootId;

  return await Model.find({
    employeeId,
    rootRecordId: rootId,
  })
    .sort({ version: -1 })
    .populate("changedBy", "credentials.email")
    .lean();
};

/**
 * Retrieve the full chronological audit history of all actions in this collection
 */
export const getMultiAllHistory = async (Model, employeeId) => {
  return await Model.find({ employeeId })
    .sort({ createdAt: -1 })
    .populate("changedBy", "credentials.email")
    .lean();
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
