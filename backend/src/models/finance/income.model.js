import mongoose from "mongoose";
import { str, num, ref, versioningHeader } from "../../utils/mongoose.js";

/**
 * =========================================================================
 * Income Model (Finance Module - Multi-Entity SCD Type 2)
 * =========================================================================
 * Tracks declared income sources, including title, source origin, year, and amount.
 */
const incomeSchema = new mongoose.Schema(
  {
    // Title of income: e.g. "Monthly Salary", "Commercial Rent", "Software Consulting"
    title: str(true),

    // Source of income (from where it comes): e.g. "Main Campus / Govt", "Rental Plaza", "Freelance"
    source: str(true),

    // Income financial/calendar year lookup code: e.g. "2024", "2025"
    year: str(true, { uppercase: true, trim: true, index: true }),

    // Optional direct reference to Lookup document
    yearLookup: ref("Lookup", false, { default: null }),

    // Income amount (numerical)
    amount: num(0, true, { min: [0, "Income amount cannot be negative."] }),

    // Optional supplementary notes
    notes: str(false, { default: "" }),

    // Universal SCD Type 2 Audit & Versioning Header
    ...versioningHeader("Income"),
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
// Fast active incomes retrieval for an employee
incomeSchema.index(
  { employeeId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);

// Fast yearly income filtering for an employee
incomeSchema.index(
  { employeeId: 1, year: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);

// Fast item version history retrieval (e.g. Salary V1 -> V2)
incomeSchema.index({ rootRecordId: 1, version: -1 });

// Fast full employee chronological audit timeline
incomeSchema.index({ employeeId: 1, version: -1 });

const Income = mongoose.model("Income", incomeSchema);

export default Income;
