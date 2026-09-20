import { z } from "zod";
import { lookupCodeValidator } from "../common.validator.js";

export const languageSchema = z.object({
  name: z
    .string({ required_error: "Language name is required." })
    .trim()
    .min(1, "Language name cannot be empty.")
    .toUpperCase(),

  canSpeak: z.boolean().optional().default(false),
  speakingLevel: lookupCodeValidator("PROFICIENCY_LEVEL", false),

  canWrite: z.boolean().optional().default(false),
  writingLevel: lookupCodeValidator("PROFICIENCY_LEVEL", false),

  canRead: z.boolean().optional().default(false),
  readingLevel: lookupCodeValidator("PROFICIENCY_LEVEL", false),

  notes: z.string().trim().optional(),
});

export default languageSchema;
