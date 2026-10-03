import express from "express";
import {
  addHomeExpense,
  addOtherExpense,
  deleteHomeExpense,
  deleteOtherExpense,
  getAllHomeExpensesHistory,
  getAllOtherExpensesHistory,
  getHomeExpenseItemHistory,
  getHomeExpenses,
  getOtherExpenseItemHistory,
  getOtherExpenses,
  updateHomeExpense,
  updateOtherExpense,
} from "../../controllers/finance/expense.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  homeExpenseSchema,
  otherExpenseSchema,
} from "../../validators/finance/expense.validator.js";

const router = express.Router();

router.use(protect);

// -------------------------------------------------------------------------
// Home Expenses Routes (/api/v1/finance/expenses/home)
// -------------------------------------------------------------------------
router.get("/home", getHomeExpenses);
router.post("/home", validate(homeExpenseSchema), addHomeExpense);
router.put("/home/:id", validate(homeExpenseSchema), updateHomeExpense);
router.delete("/home/:id", deleteHomeExpense);
router.get("/home/:id/history", getHomeExpenseItemHistory);
router.get("/home/history/all", getAllHomeExpensesHistory);

// -------------------------------------------------------------------------
// Other Expenses Routes (/api/v1/finance/expenses/other)
// -------------------------------------------------------------------------
router.get("/other", getOtherExpenses);
router.post("/other", validate(otherExpenseSchema), addOtherExpense);
router.put("/other/:id", validate(otherExpenseSchema), updateOtherExpense);
router.delete("/other/:id", deleteOtherExpense);
router.get("/other/:id/history", getOtherExpenseItemHistory);
router.get("/other/history/all", getAllOtherExpensesHistory);

export default router;
