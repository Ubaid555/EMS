import { z } from "zod";

export const cnicSchema = z.object({
  cnicNumber: z
    .string({ required_error: "CNIC number is required." })
    .trim()
    .min(5, "CNIC number must be at least 5 characters.")
    .max(30, "CNIC number cannot exceed 30 characters."),

  fatherOrHusbandName: z.string().trim().optional(),

  dateOfIssue: z.coerce.date({ invalid_type_error: "Invalid date format for date of issue." }).optional(),

  issueCity: z.string().trim().optional(),

  identificationMark: z.string().trim().optional(),

  expiryDate: z.coerce.date({ invalid_type_error: "Invalid date format for expiry date." }).optional(),

  notes: z.string().trim().optional(),
});

export default cnicSchema;
