import EmployeeCnic from "../../models/employee/cnic.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import versionedCrud from "../../services/versionedCrud.service.js";

/**
 * Get current active CNIC
 * GET /api/v1/employee/cnic
 */
export const getCnic = asyncHandler(async (req, res) => {
  const data = await versionedCrud.getSingleActive(
    EmployeeCnic,
    req.employee._id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, data, "CNIC retrieved successfully."));
});

/**
 * Save or Update CNIC (triggers SCD Type 2 version chaining)
 * PUT /api/v1/employee/cnic
 */
export const updateCnic = asyncHandler(async (req, res) => {
  const result = await versionedCrud.saveSingle(
    EmployeeCnic,
    req.employee._id,
    req.body,
    req.employee._id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "CNIC saved successfully."));
});

/**
 * Get full audit history for CNIC
 * GET /api/v1/employee/cnic/history
 */
export const getCnicHistory = asyncHandler(async (req, res) => {
  const history = await versionedCrud.getSingleHistory(
    EmployeeCnic,
    req.employee._id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, history, "CNIC history retrieved successfully."));
});
