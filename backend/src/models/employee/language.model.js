import mongoose from "mongoose";
import { versioningHeader } from "../../utils/mongoose.js";
import { baseLanguageFields } from "../common/index.js";

const employeeLanguageSchema = new mongoose.Schema(
  {
    // Reusable language proficiency fields (name, canSpeak, speakingLevel, etc.)
    ...baseLanguageFields(),

    // Audit & SCD Type 2 Multi-Entity Versioning Header
    ...versioningHeader("EmployeeLanguage"),
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
// Fast active languages retrieval for an employee
employeeLanguageSchema.index(
  { employeeId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);

// Prevent duplicate active records for the same language on the same employee
employeeLanguageSchema.index(
  { employeeId: 1, name: 1, isCurrent: 1 },
  { unique: true, partialFilterExpression: { isCurrent: true, isDeleted: false } }
);

// Fast chronological history retrieval for a single language item (e.g. English V1 -> V2)
employeeLanguageSchema.index({ rootRecordId: 1, version: -1 });

// Fast chronological audit timeline across all languages for an employee
employeeLanguageSchema.index({ employeeId: 1, version: -1 });

const EmployeeLanguage = mongoose.model(
  "EmployeeLanguage",
  employeeLanguageSchema
);

export default EmployeeLanguage;
