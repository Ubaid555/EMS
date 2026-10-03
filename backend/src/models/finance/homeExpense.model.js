import mongoose from "mongoose";
import { str, num, ref, versioningHeader } from "../../utils/mongoose.js";

/**
 * =========================================================================
 * Home Expense Model (Finance Module - Multi-Entity SCD Type 2)
 * =========================================================================
 * Tracks declared domestic/household expenses (e.g. Rent, Utilities, Groceries, Education),
 * with financial year lookup, title, and amount.
 */
const homeExpenseSchema = new mongoose.Schema(
  {
    // Financial/Calendar year lookup code: e.g. "2024", "2025"
    year: str(true, { uppercase: true, trim: true, index: true }),

    // Optional direct reference to Lookup document
    yearLookup: ref("Lookup", false, { default: null }),

    // Title of home expense: e.g. "House Rent", "Electricity & Gas", "School Fees"
    title: str(true),

    // Expense amount (numerical)
    amount: num(0, true, { min: [0, "Home expense amount cannot be negative."] }),

    // Optional supplementary notes
    notes: str(false, { default: "" }),

    // Universal SCD Type 2 Audit & Versioning Header
    ...versioningHeader("HomeExpense"),
  },
  {
    timestamps: true,
  }
);

/**
 * =========================================================================
 * Indexes for Blazing High-Volume Performance
 * =========================================================================
 */
// Fast active home expenses retrieval for an employee
homeExpenseSchema.index(
  { employeeId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);

// Fast yearly home expense filtering for an employee
homeExpenseSchema.index(
  { employeeId: 1, year: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);

// Fast item version history retrieval (e.g. Rent V1 -> V2)
homeExpenseSchema.index({ rootRecordId: 1, version: -1 });

// Fast full employee chronological audit timeline
homeExpenseSchema.index({ employeeId: 1, version: -1 });

const HomeExpense = mongoose.model("HomeExpense", homeExpenseSchema);

export default HomeExpense;
