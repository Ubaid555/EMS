import EmployeeLanguage from "../../models/employee/language.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import versionedCrud from "../../services/versionedCrud.service.js";

/**
 * Get all active languages for the authenticated employee (paginated & searchable)
 * GET /api/v1/employee/languages
 */
export const getLanguages = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiActive(
    EmployeeLanguage,
    req.employee._id,
    req.query,
    {
      defaultSearchFields: [
        "name",
        "notes",
        "speakingLevel",
        "readingLevel",
        "writingLevel",
      ],
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Languages retrieved successfully.", pagination));
});

/**
 * Add a new language item
 * POST /api/v1/employee/languages
 */
export const addLanguage = asyncHandler(async (req, res) => {
  const result = await versionedCrud.createMulti(
    EmployeeLanguage,
    req.employee._id,
    req.body,
    req.employee._id
  );

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Language added successfully."));
});

/**
 * Update a specific language item (versions only this item)
 * PUT /api/v1/employee/languages/:id
 */
export const updateLanguage = asyncHandler(async (req, res) => {
  const result = await versionedCrud.updateMulti(
    EmployeeLanguage,
    req.employee._id,
    req.params.id,
    req.body,
    req.employee._id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Language updated successfully."));
});

/**
 * Delete a specific language item (soft-deletes with tombstone)
 * DELETE /api/v1/employee/languages/:id
 */
export const deleteLanguage = asyncHandler(async (req, res) => {
  await versionedCrud.deleteMulti(
    EmployeeLanguage,
    req.employee._id,
    req.params.id,
    req.employee._id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Language removed successfully."));
});

/**
 * Get version history of a specific language item (paginated & searchable)
 * GET /api/v1/employee/languages/:id/history
 */
export const getLanguageItemHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiItemHistory(
    EmployeeLanguage,
    req.employee._id,
    req.params.id,
    req.query,
    {
      defaultSearchFields: ["name", "notes", "actionType"],
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Language item history retrieved successfully.", pagination));
});

/**
 * Get full chronological history of all language changes for the employee (paginated & searchable)
 * GET /api/v1/employee/languages/history/all
 */
export const getAllLanguagesHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiAllHistory(
    EmployeeLanguage,
    req.employee._id,
    req.query,
    {
      defaultSearchFields: ["name", "notes", "actionType"],
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Full language audit history retrieved successfully.", pagination));
});
