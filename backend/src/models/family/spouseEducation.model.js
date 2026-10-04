import mongoose from "mongoose";
import { str, ref, versioningHeader } from "../../utils/mongoose.js";

/**
 * =========================================================================
 * Spouse Education Model (Family Module - Multi-Entity SCD Type 2)
 * =========================================================================
 * Academic qualifications and degrees for a specific spouse.
 */
const spouseEducationSchema = new mongoose.Schema(
  {
    spouseId: ref("Spouse", true, { index: true }),

    degreeLevel: str(true, { uppercase: true, index: true }), // Lookup: DEGREE_LEVEL
    degreeName: str(true), // e.g. "Bachelors in Computer Science"
    institute: str(true), // e.g. "University of the Punjab"
    passingYear: str(false), // e.g. "2018"
    gradeOrGpa: str(false), // e.g. "3.8 CGPA" or "A+"
    notes: str(false, { default: "" }),

    ...versioningHeader("SpouseEducation"),
  },
  {
    timestamps: true,
  }
);

spouseEducationSchema.index(
  { employeeId: 1, spouseId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);
spouseEducationSchema.index({ rootRecordId: 1, version: -1 });

const SpouseEducation = mongoose.model("SpouseEducation", spouseEducationSchema);

export default SpouseEducation;
