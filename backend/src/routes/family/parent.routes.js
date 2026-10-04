import express from "express";
import {
  addParent,
  addParentAsset,
  deleteParent,
  deleteParentAsset,
  deleteParentCnic,
  deleteParentMedical,
  getAllParentAssetsHistory,
  getAllParentsHistory,
  getParentAssetItemHistory,
  getParentAssets,
  getParentCnic,
  getParentCnicHistory,
  getParentItemHistory,
  getParentMedical,
  getParentMedicalHistory,
  getParents,
  saveParentCnic,
  saveParentMedical,
  updateParent,
  updateParentAsset,
} from "../../controllers/family/parent.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  parentAssetSchema,
  parentCnicSchema,
  parentMedicalSchema,
  parentSchema,
} from "../../validators/family/parent.validator.js";

const router = express.Router();

router.use(protect);

// -------------------------------------------------------------------------
// Parent Core Routes (Fathers & Mothers)
// -------------------------------------------------------------------------
router.get("/", getParents);
router.post("/", validate(parentSchema), addParent);
router.put("/:id", validate(parentSchema), updateParent);
router.delete("/:id", deleteParent);
router.get("/:id/history", getParentItemHistory);
router.get("/history/all", getAllParentsHistory);

// -------------------------------------------------------------------------
// Parent CNIC Routes
// -------------------------------------------------------------------------
router.get("/:parentId/cnic", getParentCnic);
router.post("/:parentId/cnic", validate(parentCnicSchema), saveParentCnic);
router.put("/:parentId/cnic", validate(parentCnicSchema), saveParentCnic);
router.delete("/:parentId/cnic", deleteParentCnic);
router.get("/:parentId/cnic/history", getParentCnicHistory);

// -------------------------------------------------------------------------
// Parent Medical Category Routes
// -------------------------------------------------------------------------
router.get("/:parentId/medical", getParentMedical);
router.post("/:parentId/medical", validate(parentMedicalSchema), saveParentMedical);
router.put("/:parentId/medical", validate(parentMedicalSchema), saveParentMedical);
router.delete("/:parentId/medical", deleteParentMedical);
router.get("/:parentId/medical/history", getParentMedicalHistory);

// -------------------------------------------------------------------------
// Parent Assets Routes
// -------------------------------------------------------------------------
router.get("/:parentId/assets", getParentAssets);
router.post("/:parentId/assets", validate(parentAssetSchema), addParentAsset);
router.put("/:parentId/assets/:id", validate(parentAssetSchema), updateParentAsset);
router.delete("/:parentId/assets/:id", deleteParentAsset);
router.get("/:parentId/assets/:id/history", getParentAssetItemHistory);
router.get("/:parentId/assets/history/all", getAllParentAssetsHistory);

export default router;
