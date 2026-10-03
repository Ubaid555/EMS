import mongoose from "mongoose";
import { str, num, ref, versioningHeader } from "../../utils/mongoose.js";

/**
 * =========================================================================
 * Other Expense Model (Finance Module - Multi-Entity SCD Type 2)
 * =========================================================================
 * Tracks miscellaneous, commercial, travel, medical, or other non-household expenses,
 * with financial year lookup, title, and amount.
 */
const otherExpenseSchema = new mongoose.Schema(
  {
    // Financial/Calendar year lookup code: e.g. "2024", "2025"
    year: str(true, { uppercase: true, trim: true, index: true }),

    // Optional direct reference to Lookup document
    yearLookup: ref("Lookup", false, { default: null }),

    // Title of other expense: e.g. "Vehicle Maintenance", "Medical Treatment", "Travel"
    title: str(true),

    // Expense amount (numerical)
    amount: num(0, true, { min: [0, "Other expense amount cannot be negative."] }),

    // Optional supplementary notes
    notes: str(false, { default: "" }),

    // Universal SCD Type 2 Audit & Versioning Header
    ...versioningHeader("OtherExpense"),
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
// Fast active other expenses retrieval for an employee
otherExpenseSchema.index(
  { employeeId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);

// Fast yearly other expense filtering for an employee
otherExpenseSchema.index(
  { employeeId: 1, year: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);

// Fast item version history retrieval (e.g. Travel V1 -> V2)
otherExpenseSchema.index({ rootRecordId: 1, version: -1 });

// Fast full employee chronological audit timeline
otherExpenseSchema.index({ employeeId: 1, version: -1 });

const OtherExpense = mongoose.model("OtherExpense", otherExpenseSchema);

export default OtherExpense;
