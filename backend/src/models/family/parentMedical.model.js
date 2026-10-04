import mongoose from "mongoose";
import { str, ref, versioningHeader } from "../../utils/mongoose.js";

/**
 * =========================================================================
 * Parent Medical Model (Family Module - Scoped SCD Type 2)
 * =========================================================================
 * Healthcare, hospital category, and chronic conditions scoped to a specific parent.
 */
const parentMedicalSchema = new mongoose.Schema(
  {
    parentId: ref("Parent", true, { index: true }),

    category: str(true, { uppercase: true, default: "CATEGORY_B" }), // Lookup: MEDICAL_CATEGORY
    bloodGroup: str(false, { uppercase: true }), // Lookup: BLOOD_GROUP
    hospitalRegistrationNumber: str(false),
    chronicIllness: str(false), // e.g. "Diabetes, Hypertension"
    specialCareInstructions: str(false),
    notes: str(false, { default: "" }),

    ...versioningHeader("ParentMedical"),
  },
  {
    timestamps: true,
  }
);

parentMedicalSchema.index(
  { employeeId: 1, parentId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);
parentMedicalSchema.index({ rootRecordId: 1, version: -1 });

const ParentMedical = mongoose.model("ParentMedical", parentMedicalSchema);

export default ParentMedical;
