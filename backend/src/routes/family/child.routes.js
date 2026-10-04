import express from "express";
import {
  addChild,
  addChildEducation,
  deleteChild,
  deleteChildCnic,
  deleteChildEducation,
  deleteChildOccupation,
  getAllChildEducationsHistory,
  getAllChildrenHistory,
  getChildCnic,
  getChildCnicHistory,
  getChildEducationItemHistory,
  getChildEducations,
  getChildItemHistory,
  getChildOccupation,
  getChildOccupationHistory,
  getChildren,
  saveChildCnic,
  saveChildOccupation,
  updateChild,
  updateChildEducation,
} from "../../controllers/family/child.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  childCnicSchema,
  childEducationSchema,
  childOccupationSchema,
  childSchema,
} from "../../validators/family/child.validator.js";

const router = express.Router();

router.use(protect);

// -------------------------------------------------------------------------
// Child Core Routes
// -------------------------------------------------------------------------
router.get("/", getChildren);
router.post("/", validate(childSchema), addChild);
router.put("/:id", validate(childSchema), updateChild);
router.delete("/:id", deleteChild);
router.get("/:id/history", getChildItemHistory);
router.get("/history/all", getAllChildrenHistory);

// -------------------------------------------------------------------------
// Child CNIC / B-Form Routes
// -------------------------------------------------------------------------
router.get("/:childId/cnic", getChildCnic);
router.post("/:childId/cnic", validate(childCnicSchema), saveChildCnic);
router.put("/:childId/cnic", validate(childCnicSchema), saveChildCnic);
router.delete("/:childId/cnic", deleteChildCnic);
router.get("/:childId/cnic/history", getChildCnicHistory);

// -------------------------------------------------------------------------
// Child Education Routes
// -------------------------------------------------------------------------
router.get("/:childId/education", getChildEducations);
router.post("/:childId/education", validate(childEducationSchema), addChildEducation);
router.put("/:childId/education/:id", validate(childEducationSchema), updateChildEducation);
router.delete("/:childId/education/:id", deleteChildEducation);
router.get("/:childId/education/:id/history", getChildEducationItemHistory);
router.get("/:childId/education/history/all", getAllChildEducationsHistory);

// -------------------------------------------------------------------------
// Child Occupation Routes
// -------------------------------------------------------------------------
router.get("/:childId/occupation", getChildOccupation);
router.post("/:childId/occupation", validate(childOccupationSchema), saveChildOccupation);
router.put("/:childId/occupation", validate(childOccupationSchema), saveChildOccupation);
router.delete("/:childId/occupation", deleteChildOccupation);
router.get("/:childId/occupation/history", getChildOccupationHistory);

export default router;
