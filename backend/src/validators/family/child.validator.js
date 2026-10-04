import { z } from "zod";
import { lookupCodeValidator } from "../common.validator.js";

/**
 * Zod validation schema for Child Core Profile
 */
export const childSchema = z.object({
  name: z
    .string({ required_error: "Child name is required." })
    .trim()
    .min(1, "Child name cannot be empty."),

  gender: lookupCodeValidator("GENDER", true),
  dateOfBirth: z.coerce.date({ required_error: "Date of birth is required." }),
  childType: lookupCodeValidator("CHILD_TYPE", false),
  orderOfBirth: z.coerce.number().optional().default(1),
  isAlive: z.boolean().optional().default(true),
  deathDate: z.coerce.date().optional(),
  isDependent: z.boolean().optional().default(true),
  maritalStatus: lookupCodeValidator("MARITAL_STATUS", false),
  notes: z.string().trim().optional(),
});

/**
 * Zod validation schema for Child CNIC / B-Form
 */
export const childCnicSchema = z.object({
  idType: z.enum(["B_FORM", "CNIC"]).optional().default("B_FORM"),
  idNumber: z
    .string({ required_error: "ID / B-Form number is required." })
    .trim()
    .min(5, "ID / B-Form number must be valid."),

  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  familyNumber: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

/**
 * Zod validation schema for Child Education
 */
export const childEducationSchema = z.object({
  institute: z
    .string({ required_error: "Institute name is required." })
    .trim()
    .min(1, "Institute name cannot be empty."),

  currentClass: z
    .string({ required_error: "Current class/grade is required." })
    .trim()
    .min(1, "Current class/grade cannot be empty."),

  enrollmentStatus: lookupCodeValidator("STUDY_STATUS", false),
  boardOrUniversity: z.string().trim().optional(),
  rollNumber: z.string().trim().optional(),
  isFeeReimbursable: z.boolean().optional().default(false),
  notes: z.string().trim().optional(),
});

/**
 * Zod validation schema for Child Occupation
 */
export const childOccupationSchema = z.object({
  status: lookupCodeValidator("CHILD_OCCUPATION_STATUS", true),
  organizationName: z.string().trim().optional(),
  designation: z.string().trim().optional(),
  monthlyIncome: z.coerce.number().min(0).optional().default(0),
  notes: z.string().trim().optional(),
});

export default {
  childSchema,
  childCnicSchema,
  childEducationSchema,
  childOccupationSchema,
};
