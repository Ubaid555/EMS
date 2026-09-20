import express from "express";
import {
  getCnic,
  getCnicHistory,
  updateCnic,
} from "../../controllers/employee/cnic.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { cnicSchema } from "../../validators/employee/cnic.validator.js";

const router = express.Router();

router.use(protect);

router.get("/", getCnic);
router.put("/", validate(cnicSchema), updateCnic);
router.get("/history", getCnicHistory);

export default router;
