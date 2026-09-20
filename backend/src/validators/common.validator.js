import { z } from "zod";
import { validateLookupField } from "../services/lookup.service.js";

/**
 * =========================================
 * Reusable Zod Validation Building Blocks
 * =========================================
 */

// Helper to validate a code against an active Lookup category
export const lookupCodeValidator = (category, isRequired = true) => {
  let schema = z.string({
    required_error: `${category} is required.`,
    invalid_type_error: `${category} must be a string.`,
  }).trim().toUpperCase();

  if (!isRequired) {
    schema = schema.optional();
  }

  return schema.superRefine((val, ctx) => {
    if (!val && !isRequired) return;
    try {
      validateLookupField(category, val);
    } catch (err) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: err.message,
      });
    }
  });
};

// Reusable Place Selector validator
export const placeSelectorValidator = z
  .object({
    country: z.string().trim().optional(),
    city: z.string().trim().optional(),
    district: z.string().trim().optional(),
    town: z.string().trim().optional(),
    localityOrMuhalla: z.string().trim().optional(),
  })
  .optional()
  .default({});

// Reusable Date Range + Notes validator
export const dateRangeNotesValidator = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  notes: z.string().trim().optional(),
});
