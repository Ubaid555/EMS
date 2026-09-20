import { Schema } from "mongoose";

/**
 * =========================================
 * Reusable Mongoose Schema Field Helpers (Primitives Only)
 * =========================================
 */

// ObjectId reference to another model
export const ref = (modelName, required = false, options = {}) => ({
  type: Schema.Types.ObjectId,
  ref: modelName,
  required,
  ...options,
});

// Monetary / Currency field using high-precision Decimal128
export const money = (defaultValue = 0, required = false, options = {}) => ({
  type: Schema.Types.Decimal128,
  default: defaultValue,
  required,
  ...options,
});

// Trimmed string field
export const str = (required = false, options = {}) => ({
  type: String,
  trim: true,
  required,
  ...options,
});

// Normalized email string (trimmed + lowercased)
export const email = (required = false, options = {}) => ({
  type: String,
  trim: true,
  lowercase: true,
  required,
  ...options,
});

// Date field
export const date = (required = false, options = {}) => ({
  type: Date,
  required,
  ...options,
});

// Date field defaulting to current timestamp
export const dateNow = (required = false, options = {}) => ({
  type: Date,
  default: Date.now,
  required,
  ...options,
});

// Boolean field with custom default (defaults to false)
export const bool = (defaultValue = false, required = false, options = {}) => ({
  type: Boolean,
  default: defaultValue,
  required,
  ...options,
});

// Numeric field with custom default (defaults to 0)
export const num = (defaultValue = 0, required = false, options = {}) => ({
  type: Number,
  default: defaultValue,
  required,
  ...options,
});

// Enum-constrained string field
export const enumStr = (
  values,
  defaultValue = undefined,
  required = false,
  options = {}
) => ({
  type: String,
  enum: Array.isArray(values) ? values : Object.values(values),
  trim: true,
  required,
  ...(defaultValue !== undefined ? { default: defaultValue } : {}),
  ...options,
});

// Standard soft-delete attributes
export const softDeleteFields = () => ({
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: "Employee",
    default: null,
  },
});

// Standard audit trail references (who created & updated)
export const auditFields = () => ({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "Employee",
    default: null,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: "Employee",
    default: null,
  },
});

// Standard SCD Type 2 Versioning Header for Audit Trail across all forms
export const versioningHeader = (modelName = null) => ({
  employeeId: ref("Employee", true, { index: true }),
  rootRecordId: { type: Schema.Types.ObjectId, default: null, index: true },
  version: num(1, true),
  isCurrent: bool(true, true),
  isDeleted: bool(false, true),
  previousRecord: ref(modelName, false, { default: null }),
  actionType: enumStr(["CREATE", "UPDATE", "DELETE"], "CREATE", true),
  changedBy: ref("Employee", true),
  effectiveDate: dateNow(),
});

export default {
  ref,
  money,
  str,
  email,
  date,
  dateNow,
  bool,
  num,
  enumStr,
  softDeleteFields,
  auditFields,
  versioningHeader,
};
