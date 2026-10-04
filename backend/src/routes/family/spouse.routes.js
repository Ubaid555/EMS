import express from "express";
import {
  addSpouse,
  addSpouseEducation,
  deleteSpouse,
  deleteSpouseCnic,
  deleteSpouseEducation,
  deleteSpousePassport,
  getAllSpouseEducationsHistory,
  getAllSpousesHistory,
  getSpouseCnic,
  getSpouseCnicHistory,
  getSpouseEducationItemHistory,
  getSpouseEducations,
  getSpouseItemHistory,
  getSpousePassport,
  getSpousePassportHistory,
  getSpouses,
  saveSpouseCnic,
  saveSpousePassport,
  updateSpouse,
  updateSpouseEducation,
} from "../../controllers/family/spouse.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  spouseCnicSchema,
  spouseEducationSchema,
  spousePassportSchema,
  spouseSchema,
} from "../../validators/family/spouse.validator.js";

const router = express.Router();

router.use(protect);

// -------------------------------------------------------------------------
// Spouse Core Routes
// -------------------------------------------------------------------------
router.get("/", getSpouses);
router.post("/", validate(spouseSchema), addSpouse);
router.put("/:id", validate(spouseSchema), updateSpouse);
router.delete("/:id", deleteSpouse);
router.get("/:id/history", getSpouseItemHistory);
router.get("/history/all", getAllSpousesHistory);

// -------------------------------------------------------------------------
// Spouse CNIC Routes
// -------------------------------------------------------------------------
router.get("/:spouseId/cnic", getSpouseCnic);
router.post("/:spouseId/cnic", validate(spouseCnicSchema), saveSpouseCnic);
router.put("/:spouseId/cnic", validate(spouseCnicSchema), saveSpouseCnic);
router.delete("/:spouseId/cnic", deleteSpouseCnic);
router.get("/:spouseId/cnic/history", getSpouseCnicHistory);

// -------------------------------------------------------------------------
// Spouse Passport Routes
// -------------------------------------------------------------------------
router.get("/:spouseId/passport", getSpousePassport);
router.post("/:spouseId/passport", validate(spousePassportSchema), saveSpousePassport);
router.put("/:spouseId/passport", validate(spousePassportSchema), saveSpousePassport);
router.delete("/:spouseId/passport", deleteSpousePassport);
router.get("/:spouseId/passport/history", getSpousePassportHistory);

// -------------------------------------------------------------------------
// Spouse Education Routes
// -------------------------------------------------------------------------
router.get("/:spouseId/education", getSpouseEducations);
router.post("/:spouseId/education", validate(spouseEducationSchema), addSpouseEducation);
router.put("/:spouseId/education/:id", validate(spouseEducationSchema), updateSpouseEducation);
router.delete("/:spouseId/education/:id", deleteSpouseEducation);
router.get("/:spouseId/education/:id/history", getSpouseEducationItemHistory);
router.get("/:spouseId/education/history/all", getAllSpouseEducationsHistory);

export default router;
