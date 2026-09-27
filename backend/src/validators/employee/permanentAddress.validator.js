import { z } from "zod";
import { placeSelectorValidator } from "../common.validator.js";

/**
 * =========================================================================
 * Permanent Address Zod Validator (Form 10A)
 * =========================================================================
 */
export const permanentAddressSchema = z.object({
  addressLine: z.string().trim().optional(),
  street: z.string().trim().optional(),
  postOffice: z.string().trim().optional(),
  landlineNumbers: z
    .array(z.string().trim().min(3, "Landline number must be at least 3 digits."))
    .optional()
    .default([]),
  place: placeSelectorValidator,
  notes: z.string().trim().optional(),
});

export default permanentAddressSchema;
