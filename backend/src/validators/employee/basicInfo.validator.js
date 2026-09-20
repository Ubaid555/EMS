import { z } from "zod";
import {
  lookupCodeValidator,
  placeSelectorValidator,
} from "../common.validator.js";

export const basicInfoSchema = z.object({
  fullName: z
    .string({ required_error: "Full name is required." })
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name cannot exceed 100 characters."),

  previousName: z.string().trim().optional(),

  gender: lookupCodeValidator("GENDER", true),

  maritalStatus: lookupCodeValidator("MARITAL_STATUS", true),

  dateOfBirth: z.coerce.date({
    required_error: "Date of birth is required.",
    invalid_type_error: "Invalid date format for date of birth.",
  }),

  placeOfBirth: placeSelectorValidator,

  notes: z.string().trim().optional(),
});

export default basicInfoSchema;
