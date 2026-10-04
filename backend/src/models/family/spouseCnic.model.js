import mongoose from "mongoose";
import { str, ref, date, versioningHeader } from "../../utils/mongoose.js";

/**
 * =========================================================================
 * Spouse CNIC Model (Family Module - Scoped SCD Type 2)
 * =========================================================================
 * Dedicated national identity details for a specific spouse.
 */
const spouseCnicSchema = new mongoose.Schema(
  {
    spouseId: ref("Spouse", true, { index: true }),

    cnicNumber: str(true, { uppercase: true, trim: true }),
    issueDate: date(false),
    expiryDate: date(false),
    familyNumber: str(false),
    trackingNumber: str(false),
    notes: str(false, { default: "" }),

    ...versioningHeader("SpouseCnic"),
  },
  {
    timestamps: true,
  }
);

spouseCnicSchema.index(
  { employeeId: 1, spouseId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);
spouseCnicSchema.index({ rootRecordId: 1, version: -1 });

const SpouseCnic = mongoose.model("SpouseCnic", spouseCnicSchema);

export default SpouseCnic;
