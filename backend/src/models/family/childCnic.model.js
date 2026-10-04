import mongoose from "mongoose";
import { str, ref, date, versioningHeader } from "../../utils/mongoose.js";

/**
 * =========================================================================
 * Child CNIC / B-Form Model (Family Module - Scoped SCD Type 2)
 * =========================================================================
 * B-Form or CNIC details scoped to a specific child.
 */
const childCnicSchema = new mongoose.Schema(
  {
    childId: ref("Child", true, { index: true }),

    idType: str(true, { uppercase: true, default: "B_FORM" }), // "B_FORM" or "CNIC"
    idNumber: str(true, { uppercase: true, trim: true }),
    issueDate: date(false),
    expiryDate: date(false),
    familyNumber: str(false),
    notes: str(false, { default: "" }),

    ...versioningHeader("ChildCnic"),
  },
  {
    timestamps: true,
  }
);

childCnicSchema.index(
  { employeeId: 1, childId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);
childCnicSchema.index({ rootRecordId: 1, version: -1 });

const ChildCnic = mongoose.model("ChildCnic", childCnicSchema);

export default ChildCnic;
