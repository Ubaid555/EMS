import express from "express";
import {
  addIncome,
  deleteIncome,
  getAllIncomesHistory,
  getIncomeItemHistory,
  getIncomes,
  updateIncome,
} from "../../controllers/finance/income.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { incomeSchema } from "../../validators/finance/income.validator.js";

const router = express.Router();

router.use(protect);

router.get("/", getIncomes);
router.post("/", validate(incomeSchema), addIncome);
router.put("/:id", validate(incomeSchema), updateIncome);
router.delete("/:id", deleteIncome);
router.get("/:id/history", getIncomeItemHistory);
router.get("/history/all", getAllIncomesHistory);

export default router;
