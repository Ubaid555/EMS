import mongoose from "mongoose";
import { str, ref, date, versioningHeader } from "../../utils/mongoose.js";

/**
 * =========================================================================
 * Parent CNIC Model (Family Module - Scoped SCD Type 2)
 * =========================================================================
 * CNIC details scoped to a specific parent (father or mother).
 */
const parentCnicSchema = new mongoose.Schema(
  {
    parentId: ref("Parent", true, { index: true }),

    cnicNumber: str(true, { uppercase: true, trim: true }),
    issueDate: date(false),
    expiryDate: date(false),
    familyNumber: str(false),
    notes: str(false, { default: "" }),

    ...versioningHeader("ParentCnic"),
  },
  {
    timestamps: true,
  }
);

parentCnicSchema.index(
  { employeeId: 1, parentId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);
parentCnicSchema.index({ rootRecordId: 1, version: -1 });

const ParentCnic = mongoose.model("ParentCnic", parentCnicSchema);

export default ParentCnic;
