import express from "express";
import {
  getAddresses,
  getPermanentAddress,
  getPermanentHistory,
  getPresentAddress,
  getPresentHistory,
  savePermanentAddress,
  savePresentAddress,
} from "../../controllers/employee/address.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { permanentAddressSchema } from "../../validators/employee/permanentAddress.validator.js";
import { presentAddressSchema } from "../../validators/employee/presentAddress.validator.js";

const router = express.Router();

router.use(protect);

// Combined Form Load: Get both active permanent & present addresses in 1 request
router.get("/", getAddresses);

// Permanent Address Routes
router.get("/permanent", getPermanentAddress);
router.put(
  "/permanent",
  validate(permanentAddressSchema),
  savePermanentAddress
);
router.get("/permanent/history", getPermanentHistory);

// Present Address Routes
router.get("/present", getPresentAddress);
router.put("/present", validate(presentAddressSchema), savePresentAddress);
router.get("/present/history", getPresentHistory);

export default router;
