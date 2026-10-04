import {
  Child,
  ChildCnic,
  ChildEducation,
  ChildOccupation,
} from "../../models/family/index.js";
import versionedCrud from "../../services/versionedCrud.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

/**
 * =========================================================================
 * Child Controller (Family Module - Multi-Record Core & Scoped Sub-Forms)
 * =========================================================================
 */

// -------------------------------------------------------------------------
// 1. CHILD CORE PROFILE
// -------------------------------------------------------------------------

export const getChildren = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiActive(
    Child,
    req.employee._id,
    req.query,
    {
      defaultSearchFields: ["name", "gender", "childType", "notes"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Children retrieved successfully.", pagination));
});

export const addChild = asyncHandler(async (req, res) => {
  const result = await versionedCrud.createMulti(
    Child,
    req.employee._id,
    req.body,
    req.employee._id
  );
  return res
    .status(201)
    .json(new ApiResponse(201, result, "Child added successfully."));
});

export const updateChild = asyncHandler(async (req, res) => {
  const result = await versionedCrud.updateMulti(
    Child,
    req.employee._id,
    req.params.id,
    req.body,
    req.employee._id
  );
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Child profile updated successfully."));
});

export const deleteChild = asyncHandler(async (req, res) => {
  await versionedCrud.deleteMulti(
    Child,
    req.employee._id,
    req.params.id,
    req.employee._id
  );
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Child removed successfully."));
});

export const getChildItemHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiItemHistory(
    Child,
    req.employee._id,
    req.params.id,
    req.query,
    {
      defaultSearchFields: ["name", "gender", "actionType"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Child item audit history retrieved.", pagination));
});

export const getAllChildrenHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiAllHistory(
    Child,
    req.employee._id,
    req.query,
    {
      defaultSearchFields: ["name", "gender", "actionType"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "All children audit history retrieved.", pagination));
});

// -------------------------------------------------------------------------
// 2. CHILD CNIC / B-FORM (Scoped to childId)
// -------------------------------------------------------------------------

export const getChildCnic = asyncHandler(async (req, res) => {
  const data = await versionedCrud.getSingleActive(ChildCnic, req.employee._id, {
    childId: req.params.childId,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Child CNIC / B-Form retrieved successfully."));
});

export const saveChildCnic = asyncHandler(async (req, res) => {
  const result = await versionedCrud.saveSingle(
    ChildCnic,
    req.employee._id,
    { ...req.body, childId: req.params.childId },
    req.employee._id,
    { childId: req.params.childId }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Child CNIC / B-Form saved successfully."));
});

export const deleteChildCnic = asyncHandler(async (req, res) => {
  await versionedCrud.deleteSingle(
    ChildCnic,
    req.employee._id,
    req.employee._id,
    { childId: req.params.childId }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Child CNIC / B-Form removed successfully."));
});

export const getChildCnicHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getSingleHistory(
    ChildCnic,
    req.employee._id,
    req.query,
    {
      baseFilter: { childId: req.params.childId },
      defaultSearchFields: ["idNumber", "idType", "actionType"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Child CNIC audit history retrieved.", pagination));
});

// -------------------------------------------------------------------------
// 3. CHILD EDUCATION (Multi-Entry Scoped to childId)
// -------------------------------------------------------------------------

export const getChildEducations = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiActive(
    ChildEducation,
    req.employee._id,
    req.query,
    {
      baseFilter: { childId: req.params.childId },
      defaultSearchFields: ["institute", "currentClass", "boardOrUniversity"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Child education records retrieved.", pagination));
});

export const addChildEducation = asyncHandler(async (req, res) => {
  const result = await versionedCrud.createMulti(
    ChildEducation,
    req.employee._id,
    { ...req.body, childId: req.params.childId },
    req.employee._id
  );
  return res
    .status(201)
    .json(new ApiResponse(201, result, "Child education record added."));
});

export const updateChildEducation = asyncHandler(async (req, res) => {
  const result = await versionedCrud.updateMulti(
    ChildEducation,
    req.employee._id,
    req.params.id,
    req.body,
    req.employee._id
  );
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Child education updated."));
});

export const deleteChildEducation = asyncHandler(async (req, res) => {
  await versionedCrud.deleteMulti(
    ChildEducation,
    req.employee._id,
    req.params.id,
    req.employee._id
  );
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Child education removed."));
});

export const getChildEducationItemHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiItemHistory(
    ChildEducation,
    req.employee._id,
    req.params.id,
    req.query,
    {
      defaultSearchFields: ["institute", "currentClass", "actionType"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Child education item history retrieved.", pagination));
});

export const getAllChildEducationsHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiAllHistory(
    ChildEducation,
    req.employee._id,
    req.query,
    {
      baseFilter: { childId: req.params.childId },
      defaultSearchFields: ["institute", "currentClass", "actionType"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "All child education history retrieved.", pagination));
});

// -------------------------------------------------------------------------
// 4. CHILD OCCUPATION (Scoped to childId)
// -------------------------------------------------------------------------

export const getChildOccupation = asyncHandler(async (req, res) => {
  const data = await versionedCrud.getSingleActive(ChildOccupation, req.employee._id, {
    childId: req.params.childId,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Child occupation retrieved."));
});

export const saveChildOccupation = asyncHandler(async (req, res) => {
  const result = await versionedCrud.saveSingle(
    ChildOccupation,
    req.employee._id,
    { ...req.body, childId: req.params.childId },
    req.employee._id,
    { childId: req.params.childId }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Child occupation saved."));
});

export const deleteChildOccupation = asyncHandler(async (req, res) => {
  await versionedCrud.deleteSingle(
    ChildOccupation,
    req.employee._id,
    req.employee._id,
    { childId: req.params.childId }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Child occupation removed."));
});

export const getChildOccupationHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getSingleHistory(
    ChildOccupation,
    req.employee._id,
    req.query,
    {
      baseFilter: { childId: req.params.childId },
      defaultSearchFields: ["status", "organizationName", "actionType"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Child occupation audit history retrieved.", pagination));
});

export default {
  getChildren,
  addChild,
  updateChild,
  deleteChild,
  getChildItemHistory,
  getAllChildrenHistory,
  getChildCnic,
  saveChildCnic,
  deleteChildCnic,
  getChildCnicHistory,
  getChildEducations,
  addChildEducation,
  updateChildEducation,
  deleteChildEducation,
  getChildEducationItemHistory,
  getAllChildEducationsHistory,
  getChildOccupation,
  saveChildOccupation,
  deleteChildOccupation,
  getChildOccupationHistory,
};
