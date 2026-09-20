import { Schema } from "mongoose";
import { str } from "../../utils/mongoose.js";

/**
 * Reusable Place Selector Sub-Schema
 * Cascading: Country -> City -> District -> Town -> Muhalla/Locality (typeable custom string)
 * Used in: Place of Birth, Addresses, Postings, etc.
 */
export const placeSelectorSchema = new Schema(
  {
    country: str(false),
    city: str(false),
    district: str(false),
    town: str(false),
    localityOrMuhalla: str(false),
  },
  { _id: false }
);

export default placeSelectorSchema;
