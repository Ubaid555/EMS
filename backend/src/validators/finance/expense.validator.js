import { z } from "zod";
import { lookupCodeValidator } from "../common.validator.js";

/**
 * Zod validation schema for Home Expense
 */
export const homeExpenseSchema = z.object({
  year: lookupCodeValidator("YEAR", true),

  title: z
    .string({ required_error: "Expense title is required." })
    .trim()
    .min(1, "Expense title cannot be empty."),

  amount: z.coerce
    .number({
      required_error: "Expense amount is required.",
      invalid_type_error: "Expense amount must be a number.",
    })
    .min(0, "Expense amount cannot be negative."),

  notes: z.string().trim().optional(),
});

/**
 * Zod validation schema for Other Expense
 */
export const otherExpenseSchema = z.object({
  year: lookupCodeValidator("YEAR", true),

  title: z
    .string({ required_error: "Expense title is required." })
    .trim()
    .min(1, "Expense title cannot be empty."),

  amount: z.coerce
    .number({
      required_error: "Expense amount is required.",
      invalid_type_error: "Expense amount must be a number.",
    })
    .min(0, "Expense amount cannot be negative."),

  notes: z.string().trim().optional(),
});

export default {
  homeExpenseSchema,
  otherExpenseSchema,
};
