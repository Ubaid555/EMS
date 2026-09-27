import PermanentAddress from "../../models/employee/permanentAddress.model.js";
import PresentAddress from "../../models/employee/presentAddress.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  getSingleActive,
  getSingleHistory,
  saveSingle,
} from "../../services/versionedCrud.service.js";

/**
 * =========================================================================
 * Employee Address Controller (Form 10 - Permanent & Present Addresses)
 * =========================================================================
 */

/**
 * Fetch both active Permanent and Present addresses in 1 single call (Form Load)
 * GET /api/v1/employee/addresses
 */
export const getAddresses = asyncHandler(async (req, res) => {
  const [permanent, present] = await Promise.all([
    getSingleActive(PermanentAddress, req.employee._id),
    getSingleActive(PresentAddress, req.employee._id),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { permanent, present },
      "Active addresses fetched successfully."
    )
  );
});

/**
 * Fetch current active Permanent Address
 * GET /api/v1/employee/addresses/permanent
 */
export const getPermanentAddress = asyncHandler(async (req, res) => {
  const permanent = await getSingleActive(PermanentAddress, req.employee._id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        permanent,
        "Active permanent address fetched successfully."
      )
    );
});

/**
 * Save or Update Permanent Address (Triggers SCD Type 2 versioning)
 * PUT /api/v1/employee/addresses/permanent
 */
export const savePermanentAddress = asyncHandler(async (req, res) => {
  const record = await saveSingle(
    PermanentAddress,
    req.employee._id,
    req.body,
    req.employee._id
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        record,
        "Permanent address saved and versioned successfully."
      )
    );
});

/**
 * Get chronological audit history of Permanent Address (paginated & searchable)
 * GET /api/v1/employee/addresses/permanent/history
 */
export const getPermanentHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await getSingleHistory(
    PermanentAddress,
    req.employee._id,
    req.query,
    {
      defaultSearchFields: ["addressLine", "street", "postOffice", "actionType"],
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        data,
        "Permanent address audit history retrieved.",
        pagination
      )
    );
});

/**
 * Fetch current active Present Address
 * GET /api/v1/employee/addresses/present
 */
export const getPresentAddress = asyncHandler(async (req, res) => {
  const present = await getSingleActive(PresentAddress, req.employee._id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        present,
        "Active present address fetched successfully."
      )
    );
});

/**
 * Save or Update Present Address (Handles sameAsPermanent & isForeignAddress)
 * PUT /api/v1/employee/addresses/present
 */
export const savePresentAddress = asyncHandler(async (req, res) => {
  let payload = { ...req.body };

  // -----------------------------------------------------------------------
  // Scenario 1: sameAsPermanent is true -> Snapshot copy from Permanent
  // -----------------------------------------------------------------------
  if (payload.sameAsPermanent === true) {
    const activePermanent = await getSingleActive(
      PermanentAddress,
      req.employee._id
    );

    if (!activePermanent) {
      throw new ApiError(
        400,
        "Active Permanent Address not found. Please create your Permanent Address first before selecting 'Same as Permanent'."
      );
    }

    payload = {
      sameAsPermanent: true,
      isForeignAddress: false,
      addressLine: activePermanent.addressLine || "",
      street: activePermanent.street || "",
      postOffice: activePermanent.postOffice || "",
      landlineNumbers: activePermanent.landlineNumbers || [],
      place: activePermanent.place || {},
      notes: payload.notes || "Snapshot copied from Permanent Address",
    };
  }

  // -----------------------------------------------------------------------
  // Scenario 2: isForeignAddress is true -> Clear local fields
  // -----------------------------------------------------------------------
  else if (payload.isForeignAddress === true) {
    payload = {
      sameAsPermanent: false,
      isForeignAddress: true,
      foreignAddress: payload.foreignAddress || "",
      telegraphOffice: payload.telegraphOffice || "",
      notes: payload.notes || "",
    };
  }

  const record = await saveSingle(
    PresentAddress,
    req.employee._id,
    payload,
    req.employee._id
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        record,
        "Present address saved and versioned successfully."
      )
    );
});

/**
 * Get chronological audit history of Present Address (paginated & searchable)
 * GET /api/v1/employee/addresses/present/history
 */
export const getPresentHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await getSingleHistory(
    PresentAddress,
    req.employee._id,
    req.query,
    {
      defaultSearchFields: [
        "addressLine",
        "foreignAddress",
        "street",
        "telegraphOffice",
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
        "Present address audit history retrieved.",
        pagination
      )
    );
});

export default {
  getAddresses,
  getPermanentAddress,
  savePermanentAddress,
  getPermanentHistory,
  getPresentAddress,
  savePresentAddress,
  getPresentHistory,
};
