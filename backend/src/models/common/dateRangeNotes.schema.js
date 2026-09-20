import { str, date } from "../../utils/mongoose.js";

/**
 * Reusable Date Range & Notes Sub-Schema Fields
 * Extracted from repeating pattern: from, to, notes
 * Used in: Education, Nationalities, Passports, Previous Addresses, Experience, etc.
 */
export const dateRangeNotesFields = () => ({
  from: date(false),
  to: date(false),
  notes: str(false),
});

export default dateRangeNotesFields;
