import mongoose from "mongoose";
import { str, bool, date, versioningHeader } from "../../utils/mongoose.js";

/**
 * =========================================================================
 * Spouse Core Model (Family Module - Multi-Entity SCD Type 2)
 * =========================================================================
 * Supports multiple spouses (e.g. 1st wife, 2nd wife, past/divorced/deceased).
 */
const spouseSchema = new mongoose.Schema(
  {
    name: str(true),
    marriageDate: date(false),
    status: str(true, { uppercase: true, default: "MARRIED", index: true }), // Lookup: SPOUSE_STATUS
    isAlive: bool(true),
    deathDate: date(false),
    isDependent: bool(true),
    nationality: str(false, { default: "PAKISTANI", uppercase: true }),
    notes: str(false, { default: "" }),

    ...versioningHeader("Spouse"),
  },
  {
    timestamps: true,
  }
);

spouseSchema.index(
  { employeeId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);
spouseSchema.index({ rootRecordId: 1, version: -1 });
spouseSchema.index({ employeeId: 1, version: -1 });

const Spouse = mongoose.model("Spouse", spouseSchema);

export default Spouse;
