import { Schema } from "mongoose";
import { str } from "../../utils/mongoose.js";

/**
 * Reusable Place Selector Sub-Schema
 * Cascading: Country -> State -> District -> City -> Town -> Muhalla/Locality (typeable custom string)
 * Used in: Place of Birth, Addresses, Postings, etc.
 */
export const placeSelectorSchema = new Schema(
  {
    country: str(false, { uppercase: true }),
    state: str(false, { uppercase: true }),
    district: str(false, { uppercase: true }),
    city: str(false, { uppercase: true }),
    town: str(false, { uppercase: true }),
    localityOrMuhalla: str(false),
  },
  { _id: false }
);

export default placeSelectorSchema;
