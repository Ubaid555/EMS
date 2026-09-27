import EmployeeContact from "../../models/employee/contact.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  createMulti,
  deleteMulti,
  getMultiActive,
  getMultiAllHistory,
  getMultiItemHistory,
  updateMulti,
} from "../../services/versionedCrud.service.js";

/**
 * =========================================================================
 * Employee Contact Controller (Form 9 - Multi-Entity SCD Type 2)
 * =========================================================================
 */

/**
 * Fetch all currently active contact records for authenticated employee (paginated & searchable)
 * GET /api/v1/employee/contacts
 */
export const getContacts = asyncHandler(async (req, res) => {
  const { data, pagination } = await getMultiActive(
    EmployeeContact,
    req.employee._id,
    req.query,
    {
      defaultSearchFields: [
        "platform",
        "value",
        "contactNumber",
        "setName",
        "notes",
        "officeNumber",
        "mobileNumber",
        "permanentResidenceNumber",
        "presentResidenceNumber",
        "otherNumber",
        "category",
        "phoneType",
      ],
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Active contacts fetched successfully.", pagination));
});

/**
 * Add a new contact record (Social Media, Emergency, or Phone)
 * POST /api/v1/employee/contacts
 */
export const createContact = asyncHandler(async (req, res) => {
  const newContact = await createMulti(
    EmployeeContact,
    req.employee._id,
    req.body,
    req.employee._id
  );

  return res
    .status(201)
    .json(new ApiResponse(201, newContact, "Contact item created successfully."));
});

/**
 * Update a specific contact record with SCD Type 2 audit versioning
 * PUT /api/v1/employee/contacts/:id
 */
export const updateContact = asyncHandler(async (req, res) => {
  const updated = await updateMulti(
    EmployeeContact,
    req.employee._id,
    req.params.id,
    req.body,
    req.employee._id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Contact item updated successfully."));
});

/**
 * Soft-delete a specific contact item with an audit tombstone
 * DELETE /api/v1/employee/contacts/:id
 */
export const deleteContact = asyncHandler(async (req, res) => {
  const deleted = await deleteMulti(
    EmployeeContact,
    req.employee._id,
    req.params.id,
    req.employee._id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, deleted, "Contact item deleted successfully."));
});

/**
 * Get chronological audit version history for a single contact item (paginated & searchable)
 * GET /api/v1/employee/contacts/:id/history
 */
export const getContactHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await getMultiItemHistory(
    EmployeeContact,
    req.employee._id,
    req.params.id,
    req.query,
    {
      defaultSearchFields: [
        "platform",
        "value",
        "contactNumber",
        "setName",
        "notes",
        "actionType",
      ],
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Contact item version history retrieved.", pagination));
});

/**
 * Get full chronological audit timeline of all contact changes for this employee (paginated & searchable)
 * GET /api/v1/employee/contacts/history/all
 */
export const getAllContactsHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await getMultiAllHistory(
    EmployeeContact,
    req.employee._id,
    req.query,
    {
      defaultSearchFields: [
        "platform",
        "value",
        "contactNumber",
        "setName",
        "notes",
        "actionType",
      ],
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        data,
        "All contacts chronological audit history retrieved.",
        pagination
      )
    );
});

export default {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  getContactHistory,
  getAllContactsHistory,
};
