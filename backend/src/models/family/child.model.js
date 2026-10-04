import mongoose from "mongoose";
import { str, bool, num, date, versioningHeader } from "../../utils/mongoose.js";

/**
 * =========================================================================
 * Child Core Model (Family Module - Multi-Entity SCD Type 2)
 * =========================================================================
 * Supports multiple children (Biological, Adopted, Step-children).
 */
const childSchema = new mongoose.Schema(
  {
    name: str(true),
    gender: str(true, { uppercase: true }), // Lookup: GENDER
    dateOfBirth: date(true),
    childType: str(true, { uppercase: true, default: "BIOLOGICAL", index: true }), // Lookup: CHILD_TYPE
    orderOfBirth: num(1, false), // 1st child, 2nd child
    isAlive: bool(true),
    deathDate: date(false),
    isDependent: bool(true),
    maritalStatus: str(false, { uppercase: true, default: "SINGLE" }), // Lookup: MARITAL_STATUS
    notes: str(false, { default: "" }),

    ...versioningHeader("Child"),
  },
  {
    timestamps: true,
  }
);

childSchema.index(
  { employeeId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);
childSchema.index({ rootRecordId: 1, version: -1 });
childSchema.index({ employeeId: 1, version: -1 });

const Child = mongoose.model("Child", childSchema);

export default Child;
