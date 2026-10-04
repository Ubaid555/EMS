import { z } from "zod";
import { lookupCodeValidator } from "../common.validator.js";

/**
 * Zod validation schema for Spouse Core Profile
 */
export const spouseSchema = z.object({
  name: z
    .string({ required_error: "Spouse name is required." })
    .trim()
    .min(1, "Spouse name cannot be empty."),

  marriageDate: z.coerce.date().optional(),
  status: lookupCodeValidator("SPOUSE_STATUS", false),
  isAlive: z.boolean().optional().default(true),
  deathDate: z.coerce.date().optional(),
  isDependent: z.boolean().optional().default(true),
  nationality: z.string().trim().optional().default("PAKISTANI"),
  notes: z.string().trim().optional(),
});

/**
 * Zod validation schema for Spouse CNIC
 */
export const spouseCnicSchema = z.object({
  cnicNumber: z
    .string({ required_error: "CNIC number is required." })
    .trim()
    .min(5, "CNIC number must be valid."),

  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  familyNumber: z.string().trim().optional(),
  trackingNumber: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

/**
 * Zod validation schema for Spouse Passport
 */
export const spousePassportSchema = z.object({
  passportNumber: z
    .string({ required_error: "Passport number is required." })
    .trim()
    .min(3, "Passport number must be valid.")
    .toUpperCase(),

  country: z.string().trim().optional().default("PAKISTAN"),
  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  trackingNumber: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

/**
 * Zod validation schema for Spouse Education
 */
export const spouseEducationSchema = z.object({
  degreeLevel: lookupCodeValidator("DEGREE_LEVEL", true),

  degreeName: z
    .string({ required_error: "Degree name is required." })
    .trim()
    .min(1, "Degree name cannot be empty."),

  institute: z
    .string({ required_error: "Institute name is required." })
    .trim()
    .min(1, "Institute name cannot be empty."),

  passingYear: z.string().trim().optional(),
  gradeOrGpa: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export default {
  spouseSchema,
  spouseCnicSchema,
  spousePassportSchema,
  spouseEducationSchema,
};
