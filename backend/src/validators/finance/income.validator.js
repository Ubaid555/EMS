import { z } from "zod";
import { lookupCodeValidator } from "../common.validator.js";

/**
 * Zod validation schema for Income
 */
export const incomeSchema = z.object({
  title: z
    .string({ required_error: "Income title is required." })
    .trim()
    .min(1, "Income title cannot be empty."),

  source: z
    .string({ required_error: "Income source is required." })
    .trim()
    .min(1, "Income source cannot be empty."),

  year: lookupCodeValidator("YEAR", true),

  amount: z.coerce
    .number({
      required_error: "Income amount is required.",
      invalid_type_error: "Income amount must be a number.",
    })
    .min(0, "Income amount cannot be negative."),

  notes: z.string().trim().optional(),
});

export default incomeSchema;
