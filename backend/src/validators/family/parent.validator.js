import { z } from "zod";
import { lookupCodeValidator } from "../common.validator.js";

/**
 * Zod validation schema for Parent Core Profile
 */
export const parentSchema = z.object({
  name: z
    .string({ required_error: "Parent name is required." })
    .trim()
    .min(1, "Parent name cannot be empty."),

  parentType: lookupCodeValidator("PARENT_TYPE", true),
  lineageType: lookupCodeValidator("LINEAGE_TYPE", false),
  isAlive: z.boolean().optional().default(true),
  deathDate: z.coerce.date().optional(),
  isDependent: z.boolean().optional().default(true),
  notes: z.string().trim().optional(),
});

/**
 * Zod validation schema for Parent CNIC
 */
export const parentCnicSchema = z.object({
  cnicNumber: z
    .string({ required_error: "CNIC number is required." })
    .trim()
    .min(5, "CNIC number must be valid."),

  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
  familyNumber: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

/**
 * Zod validation schema for Parent Medical Category & Health
 */
export const parentMedicalSchema = z.object({
  category: lookupCodeValidator("MEDICAL_CATEGORY", false),
  bloodGroup: lookupCodeValidator("BLOOD_GROUP", false),
  hospitalRegistrationNumber: z.string().trim().optional(),
  chronicIllness: z.string().trim().optional(),
  specialCareInstructions: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

/**
 * Zod validation schema for Parent Assets
 */
export const parentAssetSchema = z.object({
  assetType: lookupCodeValidator("ASSET_TYPE", true),

  title: z
    .string({ required_error: "Asset title is required." })
    .trim()
    .min(1, "Asset title cannot be empty."),

  estimatedValue: z.coerce.number().min(0).optional().default(0),
  location: z.string().trim().optional(),
  ownershipSharePercentage: z.coerce.number().min(0).max(100).optional().default(100),
  notes: z.string().trim().optional(),
});

export default {
  parentSchema,
  parentCnicSchema,
  parentMedicalSchema,
  parentAssetSchema,
};
