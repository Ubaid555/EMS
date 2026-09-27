import { z } from "zod";
import { placeSelectorValidator } from "../common.validator.js";

/**
 * =========================================================================
 * Present Address Zod Validator (Form 10B)
 * =========================================================================
 * Supports:
 * - sameAsPermanent: true (no other fields required; backend auto-copies from permanent)
 * - isForeignAddress: true (foreignAddress required, telegraphOffice, notes)
 * - local address (addressLine, street, postOffice, landlines, placeSelector)
 */
export const presentAddressSchema = z
  .object({
    sameAsPermanent: z.boolean().optional().default(false),
    isForeignAddress: z.boolean().optional().default(false),

    // Local address fields
    addressLine: z.string().trim().optional(),
    street: z.string().trim().optional(),
    postOffice: z.string().trim().optional(),
    landlineNumbers: z
      .array(z.string().trim().min(3, "Landline number must be at least 3 digits."))
      .optional()
      .default([]),
    place: placeSelectorValidator,

    // Foreign address fields
    foreignAddress: z.string().trim().optional(),
    telegraphOffice: z.string().trim().optional(),

    notes: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    // If sameAsPermanent is true, fields are auto-populated by backend from Permanent Address
    if (data.sameAsPermanent) {
      return;
    }

    // If Foreign address is true, foreignAddress is required
    if (data.isForeignAddress) {
      if (!data.foreignAddress || data.foreignAddress.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["foreignAddress"],
          message:
            "Foreign address string is required when 'isForeignAddress' is selected.",
        });
      }
    }
  });

export default presentAddressSchema;
