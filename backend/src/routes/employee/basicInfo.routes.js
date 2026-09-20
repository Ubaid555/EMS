import express from "express";
import {
  getBasicInfo,
  getBasicInfoHistory,
  updateBasicInfo,
} from "../../controllers/employee/basicInfo.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { basicInfoSchema } from "../../validators/employee/basicInfo.validator.js";

const router = express.Router();

router.use(protect);

router.get("/", getBasicInfo);
router.put("/", validate(basicInfoSchema), updateBasicInfo);
router.get("/history", getBasicInfoHistory);

export default router;
