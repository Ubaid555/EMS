import { str, bool, enumStr } from "../../utils/mongoose.js";

/**
 * Reusable Language Proficiency Fields
 * Used in: Employee Languages, Job Applications, Candidate Profiles, etc.
 * Features:
 * - name: Name of the language
 * - flags (canSpeak, canWrite, canRead)
 * - proficiency levels (LOW, AVERAGE, HIGH) matching Lookup "PROFICIENCY_LEVEL"
 * - notes
 */
export const baseLanguageFields = () => ({
  name: str(true, { uppercase: true }), // e.g. "ENGLISH", "URDU", "ARABIC"

  canSpeak: bool(false),
  speakingLevel: str(false, { uppercase: true }), // e.g. "LOW", "AVERAGE", "HIGH"

  canWrite: bool(false),
  writingLevel: str(false, { uppercase: true }), // e.g. "LOW", "AVERAGE", "HIGH"

  canRead: bool(false),
  readingLevel: str(false, { uppercase: true }), // e.g. "LOW", "AVERAGE", "HIGH"

  notes: str(false),
});

export default baseLanguageFields;
