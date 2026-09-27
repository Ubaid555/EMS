import mongoose from "mongoose";
import { str, bool, versioningHeader } from "../../utils/mongoose.js";
import { placeSelectorSchema } from "../common/index.js";

/**
 * =========================================================================
 * Present Address Model (Form 10B - 1-to-1 SCD Type 2 Versioned)
 * =========================================================================
 * Stores the current living address of the employee.
 * Supports:
 * 1. sameAsPermanent flag (snapshot copied from active PermanentAddress)
 * 2. isForeignAddress flag (foreignAddress, telegraphOffice, notes)
 * 3. Standard local present address (addressLine, street, postOffice, landlines, placeSelector)
 */
const presentAddressSchema = new mongoose.Schema(
  {
    // Flags
    sameAsPermanent: bool(false, false, { default: false }),
    isForeignAddress: bool(false, false, { default: false }),

    // Local Address Fields (When isForeignAddress is false)
    addressLine: str(false),
    street: str(false),
    postOffice: str(false),
    landlineNumbers: [str(false)],
    place: {
      type: placeSelectorSchema,
      default: () => ({}),
    },

    // Foreign Address Branch (When isForeignAddress is true)
    foreignAddress: str(false),
    telegraphOffice: str(false),

    notes: str(false),

    // Audit & SCD Type 2 Single-Entity Versioning Header
    ...versioningHeader("PresentAddress"),
  },
  {
    timestamps: true,
  }
);

/**
 * =========================================
 * Indexes for Big Data Performance
 * =========================================
 */
// Fast active present address retrieval (Partial Index)
presentAddressSchema.index(
  { employeeId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);

// Chronological version history retrieval
presentAddressSchema.index({ employeeId: 1, version: -1 });

const PresentAddress = mongoose.model("PresentAddress", presentAddressSchema);

export default PresentAddress;
