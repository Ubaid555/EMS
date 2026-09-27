import express from "express";
import {
  createContact,
  deleteContact,
  getAllContactsHistory,
  getContactHistory,
  getContacts,
  updateContact,
} from "../../controllers/employee/contact.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { contactSchema } from "../../validators/employee/contact.validator.js";

const router = express.Router();

router.use(protect);

router.get("/", getContacts);
router.post("/", validate(contactSchema), createContact);
router.put("/:id", validate(contactSchema), updateContact);
router.delete("/:id", deleteContact);
router.get("/:id/history", getContactHistory);
router.get("/history/all", getAllContactsHistory);

export default router;
