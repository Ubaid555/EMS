import mongoose from "mongoose";
import { str, ref, date, versioningHeader } from "../../utils/mongoose.js";

/**
 * =========================================================================
 * Spouse Passport Model (Family Module - Scoped SCD Type 2)
 * =========================================================================
 * Dedicated international travel document details for a specific spouse.
 */
const spousePassportSchema = new mongoose.Schema(
  {
    spouseId: ref("Spouse", true, { index: true }),

    passportNumber: str(true, { uppercase: true, trim: true }),
    country: str(false, { uppercase: true, default: "PAKISTAN" }),
    issueDate: date(false),
    expiryDate: date(false),
    trackingNumber: str(false),
    notes: str(false, { default: "" }),

    ...versioningHeader("SpousePassport"),
  },
  {
    timestamps: true,
  }
);

spousePassportSchema.index(
  { employeeId: 1, spouseId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);
spousePassportSchema.index({ rootRecordId: 1, version: -1 });

const SpousePassport = mongoose.model("SpousePassport", spousePassportSchema);

export default SpousePassport;
