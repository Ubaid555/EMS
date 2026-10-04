import {
  Parent,
  ParentCnic,
  ParentMedical,
  ParentAsset,
} from "../../models/family/index.js";
import versionedCrud from "../../services/versionedCrud.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

/**
 * =========================================================================
 * Parent Controller (Family Module - Multi-Record Core & Scoped Sub-Forms)
 * =========================================================================
 */

// -------------------------------------------------------------------------
// 1. PARENT CORE PROFILE (Fathers & Mothers)
// -------------------------------------------------------------------------

export const getParents = asyncHandler(async (req, res) => {
  const baseFilter = {};
  if (req.query.parentType) {
    baseFilter.parentType = String(req.query.parentType).trim().toUpperCase();
  }

  const { data, pagination } = await versionedCrud.getMultiActive(
    Parent,
    req.employee._id,
    req.query,
    {
      baseFilter,
      defaultSearchFields: ["name", "parentType", "lineageType", "notes"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Parents retrieved successfully.", pagination));
});

export const addParent = asyncHandler(async (req, res) => {
  const result = await versionedCrud.createMulti(
    Parent,
    req.employee._id,
    req.body,
    req.employee._id
  );
  return res
    .status(201)
    .json(new ApiResponse(201, result, "Parent added successfully."));
});

export const updateParent = asyncHandler(async (req, res) => {
  const result = await versionedCrud.updateMulti(
    Parent,
    req.employee._id,
    req.params.id,
    req.body,
    req.employee._id
  );
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Parent profile updated successfully."));
});

export const deleteParent = asyncHandler(async (req, res) => {
  await versionedCrud.deleteMulti(
    Parent,
    req.employee._id,
    req.params.id,
    req.employee._id
  );
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Parent removed successfully."));
});

export const getParentItemHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiItemHistory(
    Parent,
    req.employee._id,
    req.params.id,
    req.query,
    {
      defaultSearchFields: ["name", "parentType", "actionType"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Parent item audit history retrieved.", pagination));
});

export const getAllParentsHistory = asyncHandler(async (req, res) => {
  const baseFilter = {};
  if (req.query.parentType) {
    baseFilter.parentType = String(req.query.parentType).trim().toUpperCase();
  }

  const { data, pagination } = await versionedCrud.getMultiAllHistory(
    Parent,
    req.employee._id,
    req.query,
    {
      baseFilter,
      defaultSearchFields: ["name", "parentType", "actionType"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "All parents audit history retrieved.", pagination));
});

// -------------------------------------------------------------------------
// 2. PARENT CNIC (Scoped to parentId)
// -------------------------------------------------------------------------

export const getParentCnic = asyncHandler(async (req, res) => {
  const data = await versionedCrud.getSingleActive(ParentCnic, req.employee._id, {
    parentId: req.params.parentId,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Parent CNIC retrieved successfully."));
});

export const saveParentCnic = asyncHandler(async (req, res) => {
  const result = await versionedCrud.saveSingle(
    ParentCnic,
    req.employee._id,
    { ...req.body, parentId: req.params.parentId },
    req.employee._id,
    { parentId: req.params.parentId }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Parent CNIC saved successfully."));
});

export const deleteParentCnic = asyncHandler(async (req, res) => {
  await versionedCrud.deleteSingle(
    ParentCnic,
    req.employee._id,
    req.employee._id,
    { parentId: req.params.parentId }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Parent CNIC removed successfully."));
});

export const getParentCnicHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getSingleHistory(
    ParentCnic,
    req.employee._id,
    req.query,
    {
      baseFilter: { parentId: req.params.parentId },
      defaultSearchFields: ["cnicNumber", "actionType"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Parent CNIC audit history retrieved.", pagination));
});

// -------------------------------------------------------------------------
// 3. PARENT MEDICAL CATEGORY (Scoped to parentId)
// -------------------------------------------------------------------------

export const getParentMedical = asyncHandler(async (req, res) => {
  const data = await versionedCrud.getSingleActive(ParentMedical, req.employee._id, {
    parentId: req.params.parentId,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Parent medical record retrieved."));
});

export const saveParentMedical = asyncHandler(async (req, res) => {
  const result = await versionedCrud.saveSingle(
    ParentMedical,
    req.employee._id,
    { ...req.body, parentId: req.params.parentId },
    req.employee._id,
    { parentId: req.params.parentId }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Parent medical record saved."));
});

export const deleteParentMedical = asyncHandler(async (req, res) => {
  await versionedCrud.deleteSingle(
    ParentMedical,
    req.employee._id,
    req.employee._id,
    { parentId: req.params.parentId }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Parent medical record removed."));
});

export const getParentMedicalHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getSingleHistory(
    ParentMedical,
    req.employee._id,
    req.query,
    {
      baseFilter: { parentId: req.params.parentId },
      defaultSearchFields: ["category", "bloodGroup", "chronicIllness", "actionType"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Parent medical audit history retrieved.", pagination));
});

// -------------------------------------------------------------------------
// 4. PARENT ASSETS (Multi-item Scoped to parentId)
// -------------------------------------------------------------------------

export const getParentAssets = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiActive(
    ParentAsset,
    req.employee._id,
    req.query,
    {
      baseFilter: { parentId: req.params.parentId },
      defaultSearchFields: ["title", "assetType", "location"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Parent assets retrieved successfully.", pagination));
});

export const addParentAsset = asyncHandler(async (req, res) => {
  const result = await versionedCrud.createMulti(
    ParentAsset,
    req.employee._id,
    { ...req.body, parentId: req.params.parentId },
    req.employee._id
  );
  return res
    .status(201)
    .json(new ApiResponse(201, result, "Parent asset added successfully."));
});

export const updateParentAsset = asyncHandler(async (req, res) => {
  const result = await versionedCrud.updateMulti(
    ParentAsset,
    req.employee._id,
    req.params.id,
    req.body,
    req.employee._id
  );
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Parent asset updated successfully."));
});

export const deleteParentAsset = asyncHandler(async (req, res) => {
  await versionedCrud.deleteMulti(
    ParentAsset,
    req.employee._id,
    req.params.id,
    req.employee._id
  );
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Parent asset removed successfully."));
});

export const getParentAssetItemHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiItemHistory(
    ParentAsset,
    req.employee._id,
    req.params.id,
    req.query,
    {
      defaultSearchFields: ["title", "assetType", "actionType"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Parent asset item audit history retrieved.", pagination));
});

export const getAllParentAssetsHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiAllHistory(
    ParentAsset,
    req.employee._id,
    req.query,
    {
      baseFilter: { parentId: req.params.parentId },
      defaultSearchFields: ["title", "assetType", "actionType"],
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, data, "All parent assets history retrieved.", pagination));
});

export default {
  getParents,
  addParent,
  updateParent,
  deleteParent,
  getParentItemHistory,
  getAllParentsHistory,
  getParentCnic,
  saveParentCnic,
  deleteParentCnic,
  getParentCnicHistory,
  getParentMedical,
  saveParentMedical,
  deleteParentMedical,
  getParentMedicalHistory,
  getParentAssets,
  addParentAsset,
  updateParentAsset,
  deleteParentAsset,
  getParentAssetItemHistory,
  getAllParentAssetsHistory,
};
