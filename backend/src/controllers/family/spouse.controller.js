import {
  Spouse,
  SpouseCnic,
  SpousePassport,
  SpouseEducation,
} from "../../models/family/index.js";
import versionedCrud from "../../services/versionedCrud.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

/**
 * =========================================================================
 * Spouse Controller (Family Module - Multi-Record Core & Scoped Sub-Forms)
 * =========================================================================
 */

// -------------------------------------------------------------------------
// 1. SPOUSE CORE PROFILE
// -------------------------------------------------------------------------

export const getSpouses = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiActive(
    Spouse,
    req.employee._id,
    req.query,
    {
      defaultSearchFields: ["name", "status", "nationality", "notes"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Spouses retrieved successfully.", pagination));
});

export const addSpouse = asyncHandler(async (req, res) => {
  const result = await versionedCrud.createMulti(
    Spouse,
    req.employee._id,
    req.body,
    req.employee._id
  );
  return res
    .status(201)
    .json(new ApiResponse(201, result, "Spouse added successfully."));
});

export const updateSpouse = asyncHandler(async (req, res) => {
  const result = await versionedCrud.updateMulti(
    Spouse,
    req.employee._id,
    req.params.id,
    req.body,
    req.employee._id
  );
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Spouse profile updated successfully."));
});

export const deleteSpouse = asyncHandler(async (req, res) => {
  await versionedCrud.deleteMulti(
    Spouse,
    req.employee._id,
    req.params.id,
    req.employee._id
  );
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Spouse removed successfully."));
});

export const getSpouseItemHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiItemHistory(
    Spouse,
    req.employee._id,
    req.params.id,
    req.query,
    {
      defaultSearchFields: ["name", "status", "actionType"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Spouse item audit history retrieved.", pagination));
});

export const getAllSpousesHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiAllHistory(
    Spouse,
    req.employee._id,
    req.query,
    {
      defaultSearchFields: ["name", "status", "actionType"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "All spouses audit history retrieved.", pagination));
});

// -------------------------------------------------------------------------
// 2. SPOUSE CNIC (Scoped to spouseId)
// -------------------------------------------------------------------------

export const getSpouseCnic = asyncHandler(async (req, res) => {
  const data = await versionedCrud.getSingleActive(SpouseCnic, req.employee._id, {
    spouseId: req.params.spouseId,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Spouse CNIC retrieved successfully."));
});

export const saveSpouseCnic = asyncHandler(async (req, res) => {
  const result = await versionedCrud.saveSingle(
    SpouseCnic,
    req.employee._id,
    { ...req.body, spouseId: req.params.spouseId },
    req.employee._id,
    { spouseId: req.params.spouseId }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Spouse CNIC saved successfully."));
});

export const deleteSpouseCnic = asyncHandler(async (req, res) => {
  await versionedCrud.deleteSingle(
    SpouseCnic,
    req.employee._id,
    req.employee._id,
    { spouseId: req.params.spouseId }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Spouse CNIC removed successfully."));
});

export const getSpouseCnicHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getSingleHistory(
    SpouseCnic,
    req.employee._id,
    req.query,
    {
      baseFilter: { spouseId: req.params.spouseId },
      defaultSearchFields: ["cnicNumber", "actionType"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Spouse CNIC audit history retrieved.", pagination));
});

// -------------------------------------------------------------------------
// 3. SPOUSE PASSPORT (Scoped to spouseId)
// -------------------------------------------------------------------------

export const getSpousePassport = asyncHandler(async (req, res) => {
  const data = await versionedCrud.getSingleActive(SpousePassport, req.employee._id, {
    spouseId: req.params.spouseId,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Spouse passport retrieved successfully."));
});

export const saveSpousePassport = asyncHandler(async (req, res) => {
  const result = await versionedCrud.saveSingle(
    SpousePassport,
    req.employee._id,
    { ...req.body, spouseId: req.params.spouseId },
    req.employee._id,
    { spouseId: req.params.spouseId }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Spouse passport saved successfully."));
});

export const deleteSpousePassport = asyncHandler(async (req, res) => {
  await versionedCrud.deleteSingle(
    SpousePassport,
    req.employee._id,
    req.employee._id,
    { spouseId: req.params.spouseId }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Spouse passport removed successfully."));
});

export const getSpousePassportHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getSingleHistory(
    SpousePassport,
    req.employee._id,
    req.query,
    {
      baseFilter: { spouseId: req.params.spouseId },
      defaultSearchFields: ["passportNumber", "country", "actionType"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Spouse passport audit history retrieved.", pagination));
});

// -------------------------------------------------------------------------
// 4. SPOUSE EDUCATION (Multi-Degree Scoped to spouseId)
// -------------------------------------------------------------------------

export const getSpouseEducations = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiActive(
    SpouseEducation,
    req.employee._id,
    req.query,
    {
      baseFilter: { spouseId: req.params.spouseId },
      defaultSearchFields: ["degreeName", "institute", "degreeLevel", "passingYear"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Spouse educations retrieved successfully.", pagination));
});

export const addSpouseEducation = asyncHandler(async (req, res) => {
  const result = await versionedCrud.createMulti(
    SpouseEducation,
    req.employee._id,
    { ...req.body, spouseId: req.params.spouseId },
    req.employee._id
  );
  return res
    .status(201)
    .json(new ApiResponse(201, result, "Spouse education added successfully."));
});

export const updateSpouseEducation = asyncHandler(async (req, res) => {
  const result = await versionedCrud.updateMulti(
    SpouseEducation,
    req.employee._id,
    req.params.id,
    req.body,
    req.employee._id
  );
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Spouse education updated successfully."));
});

export const deleteSpouseEducation = asyncHandler(async (req, res) => {
  await versionedCrud.deleteMulti(
    SpouseEducation,
    req.employee._id,
    req.params.id,
    req.employee._id
  );
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Spouse education removed successfully."));
});

export const getSpouseEducationItemHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiItemHistory(
    SpouseEducation,
    req.employee._id,
    req.params.id,
    req.query,
    {
      defaultSearchFields: ["degreeName", "institute", "actionType"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Spouse education item history retrieved.", pagination));
});

export const getAllSpouseEducationsHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiAllHistory(
    SpouseEducation,
    req.employee._id,
    req.query,
    {
      baseFilter: { spouseId: req.params.spouseId },
      defaultSearchFields: ["degreeName", "institute", "actionType"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "All spouse educations history retrieved.", pagination));
});

export default {
  getSpouses,
  addSpouse,
  updateSpouse,
  deleteSpouse,
  getSpouseItemHistory,
  getAllSpousesHistory,
  getSpouseCnic,
  saveSpouseCnic,
  deleteSpouseCnic,
  getSpouseCnicHistory,
  getSpousePassport,
  saveSpousePassport,
  deleteSpousePassport,
  getSpousePassportHistory,
  getSpouseEducations,
  addSpouseEducation,
  updateSpouseEducation,
  deleteSpouseEducation,
  getSpouseEducationItemHistory,
  getAllSpouseEducationsHistory,
};
