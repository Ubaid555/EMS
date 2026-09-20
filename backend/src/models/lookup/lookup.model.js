import mongoose from "mongoose";
import { str, bool, num, ref } from "../../utils/mongoose.js";

const lookupSchema = new mongoose.Schema(
  {
    // Category identifier: e.g., "GENDER", "MARITAL_STATUS", "BLOOD_GROUP", "COUNTRY", "CITY"
    category: str(true, { uppercase: true, index: true }),

    // Machine-readable code: e.g., "MALE", "FEMALE", "A_POS", "PK"
    code: str(true, { uppercase: true, trim: true }),

    // Human-readable display label: e.g., "Male", "Female", "A+", "Pakistan"
    label: str(true),

    // Sort order for displaying in frontend dropdowns
    sortOrder: num(0),

    // Soft toggle to activate/deactivate options without deleting historical data
    isActive: bool(true, false, { index: true }),

    // Parent reference for cascading dropdowns (e.g., City -> District -> Province -> Country)
    parent: ref("Lookup", false, { default: null }),

    // Optional arbitrary metadata (e.g. dial code, postal code, currency symbol, etc.)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

/**
 * =========================================
 * Indexes for Blazing High-Volume Performance
 * =========================================
 */
// Ensure uniqueness of a code within a specific category
lookupSchema.index({ category: 1, code: 1 }, { unique: true });

// Fast cascading lookups (e.g. all cities where parent is district X and isActive is true)
lookupSchema.index({ category: 1, parent: 1, isActive: 1 });

// Fast sorted dropdown query
lookupSchema.index({ category: 1, isActive: 1, sortOrder: 1, label: 1 });

const Lookup = mongoose.model("Lookup", lookupSchema);

export default Lookup;
