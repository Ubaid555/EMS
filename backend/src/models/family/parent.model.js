import mongoose from "mongoose";
import { str, bool, date, versioningHeader } from "../../utils/mongoose.js";

/**
 * =========================================================================
 * Parent Core Model (Family Module - Multi-Entity SCD Type 2)
 * =========================================================================
 * Supports multiple fathers and mothers (Biological, Adopted, Step-parents).
 */
const parentSchema = new mongoose.Schema(
  {
    name: str(true),
    parentType: str(true, { uppercase: true, index: true }), // Lookup: PARENT_TYPE (FATHER, MOTHER)
    lineageType: str(true, { uppercase: true, default: "BIOLOGICAL", index: true }), // Lookup: LINEAGE_TYPE (BIOLOGICAL, ADOPTED, STEP)
    isAlive: bool(true),
    deathDate: date(false),
    isDependent: bool(true),
    notes: str(false, { default: "" }),

    ...versioningHeader("Parent"),
  },
  {
    timestamps: true,
  }
);

parentSchema.index(
  { employeeId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);
parentSchema.index({ rootRecordId: 1, version: -1 });
parentSchema.index({ employeeId: 1, version: -1 });

const Parent = mongoose.model("Parent", parentSchema);

export default Parent;
