import mongoose from "mongoose";
import { str, versioningHeader } from "../../utils/mongoose.js";
import { placeSelectorSchema } from "../common/index.js";

/**
 * =========================================================================
 * Permanent Address Model (Form 10A - 1-to-1 SCD Type 2 Versioned)
 * =========================================================================
 * Stores the verified permanent residential address of the employee.
 * Audited with atomic SCD Type 2 version chaining.
 */
const permanentAddressSchema = new mongoose.Schema(
  {
    addressLine: str(false),
    street: str(false),
    postOffice: str(false),
    landlineNumbers: [str(false)],
    place: {
      type: placeSelectorSchema,
      default: () => ({}),
    },
    notes: str(false),

    // Audit & SCD Type 2 Single-Entity Versioning Header
    ...versioningHeader("PermanentAddress"),
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
// Fast active permanent address retrieval (Partial Index)
permanentAddressSchema.index(
  { employeeId: 1, isCurrent: 1 },
  { partialFilterExpression: { isCurrent: true, isDeleted: false } }
);

// Chronological version history retrieval
permanentAddressSchema.index({ employeeId: 1, version: -1 });

const PermanentAddress = mongoose.model(
  "PermanentAddress",
  permanentAddressSchema
);

export default PermanentAddress;
