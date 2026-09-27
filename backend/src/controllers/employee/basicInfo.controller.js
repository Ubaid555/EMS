import EmployeeBasicInfo from "../../models/employee/basicInfo.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import versionedCrud from "../../services/versionedCrud.service.js";

/**
 * Get current active Basic Info
 * GET /api/v1/employee/basic-info
 */
export const getBasicInfo = asyncHandler(async (req, res) => {
  const data = await versionedCrud.getSingleActive(
    EmployeeBasicInfo,
    req.employee._id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Basic info retrieved successfully."));
});

/**
 * Save or Update Basic Info (triggers SCD Type 2 version chaining)
 * PUT /api/v1/employee/basic-info
 */
export const updateBasicInfo = asyncHandler(async (req, res) => {
  const result = await versionedCrud.saveSingle(
    EmployeeBasicInfo,
    req.employee._id,
    req.body,
    req.employee._id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Basic info saved successfully."));
});

/**
 * Get full audit history for Basic Info (paginated & searchable)
 * GET /api/v1/employee/basic-info/history
 */
export const getBasicInfoHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getSingleHistory(
    EmployeeBasicInfo,
    req.employee._id,
    req.query,
    {
      defaultSearchFields: ["title", "notes", "actionType"],
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Basic info history retrieved successfully.", pagination));
});

