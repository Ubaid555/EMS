import { str, date } from "../../utils/mongoose.js";

/**
 * Reusable Base CNIC Fields
 * Shared across Employee Personal CNIC and Family Blood Relations (Father, Mother, Spouse, etc.)
 */
export const baseCnicFields = () => ({
  cnicNumber: str(true, { trim: true }),
  fatherOrHusbandName: str(false),
  dateOfIssue: date(false),
  issueCity: str(false),
  notes: str(false),
});

export default baseCnicFields;
