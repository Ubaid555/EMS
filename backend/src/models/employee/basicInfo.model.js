import mongoose from "mongoose";
import { str, date, versioningHeader } from "../../utils/mongoose.js";
import { placeSelectorSchema } from "../common/index.js";

const employeeBasicInfoSchema = new mongoose.Schema(
  {
    // Full legal name
    fullName: str(true),

    // Previous name (if changed after marriage or deed poll)
    previousName: str(false),

    // Gender code (matches Lookup category "GENDER", e.g. "MALE", "FEMALE", "OTHER")
    gender: str(true, { uppercase: true }),

    // Marital status code (matches Lookup category "MARITAL_STATUS", e.g. "SINGLE", "MARRIED")
    maritalStatus: str(true, { uppercase: true }),

    // Date of birth
    dateOfBirth: date(true),

    // Place of birth (Cascading: Country -> City -> District -> Town -> Muhalla/Locality)
    placeOfBirth: {
      type: placeSelectorSchema,
      default: () => ({}),
    },

    // Additional notes/remarks
    notes: str(false),

    // Audit & SCD Type 2 Versioning Header
    ...versioningHeader("EmployeeBasicInfo"),
  },
  {
    timestamps: true,
  }
);

/**
 * =========================================
 * Indexes for Blazing Big Data Performance
 * =========================================
 */
// Partial index for active current record queries (Frontend only scans this tiny index)
employeeBasicInfoSchema.index(
  { employeeId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);

// Fast chronological audit history retrieval
employeeBasicInfoSchema.index({ employeeId: 1, version: -1 });

const EmployeeBasicInfo = mongoose.model(
  "EmployeeBasicInfo",
  employeeBasicInfoSchema
);

export default EmployeeBasicInfo;
