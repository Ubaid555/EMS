import mongoose from "mongoose";
import { str, bool, ref, versioningHeader } from "../../utils/mongoose.js";

/**
 * =========================================================================
 * Child Education Model (Family Module - Multi-Entity SCD Type 2)
 * =========================================================================
 * School, college, or university education details scoped to a specific child.
 */
const childEducationSchema = new mongoose.Schema(
  {
    childId: ref("Child", true, { index: true }),

    institute: str(true), // School or college name
    currentClass: str(true), // e.g. "Grade 8", "Matric Part 2", "O-Levels"
    enrollmentStatus: str(true, { uppercase: true, default: "ENROLLED" }), // Lookup: STUDY_STATUS
    boardOrUniversity: str(false), // e.g. "Federal Board Islamabad"
    rollNumber: str(false),
    isFeeReimbursable: bool(false), // Eligibility for tuition allowance
    notes: str(false, { default: "" }),

    ...versioningHeader("ChildEducation"),
  },
  {
    timestamps: true,
  }
);

childEducationSchema.index(
  { employeeId: 1, childId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);
childEducationSchema.index({ rootRecordId: 1, version: -1 });

const ChildEducation = mongoose.model("ChildEducation", childEducationSchema);

export default ChildEducation;
