import express from "express";
import incomeRoutes from "./income.routes.js";
import expenseRoutes from "./expense.routes.js";
import { getFinanceSummary } from "../../controllers/finance/expense.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

// Consolidated Financial Summary (Income, Expenses, Net Savings)
router.get("/summary", getFinanceSummary);

// Standalone Income Flow
router.use("/incomes", incomeRoutes);

// Distributed Expenses Flow (Home Expenses & Other Expenses)
router.use("/expenses", expenseRoutes);

export default router;
