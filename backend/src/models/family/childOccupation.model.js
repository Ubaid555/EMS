import mongoose from "mongoose";
import { str, num, ref, versioningHeader } from "../../utils/mongoose.js";

/**
 * =========================================================================
 * Child Occupation Model (Family Module - Scoped SCD Type 2)
 * =========================================================================
 * Current career, employment, or student status scoped to a specific child.
 */
const childOccupationSchema = new mongoose.Schema(
  {
    childId: ref("Child", true, { index: true }),

    status: str(true, { uppercase: true, default: "STUDENT" }), // Lookup: CHILD_OCCUPATION_STATUS
    organizationName: str(false),
    designation: str(false),
    monthlyIncome: num(0, false),
    notes: str(false, { default: "" }),

    ...versioningHeader("ChildOccupation"),
  },
  {
    timestamps: true,
  }
);

childOccupationSchema.index(
  { employeeId: 1, childId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);
childOccupationSchema.index({ rootRecordId: 1, version: -1 });

const ChildOccupation = mongoose.model("ChildOccupation", childOccupationSchema);

export default ChildOccupation;
