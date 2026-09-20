import express from "express";
import {
  addLanguage,
  deleteLanguage,
  getAllLanguagesHistory,
  getLanguageItemHistory,
  getLanguages,
  updateLanguage,
} from "../../controllers/employee/language.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { languageSchema } from "../../validators/employee/language.validator.js";

const router = express.Router();

router.use(protect);

router.get("/", getLanguages);
router.post("/", validate(languageSchema), addLanguage);
router.put("/:id", validate(languageSchema), updateLanguage);
router.delete("/:id", deleteLanguage);
router.get("/:id/history", getLanguageItemHistory);
router.get("/history/all", getAllLanguagesHistory);

export default router;
