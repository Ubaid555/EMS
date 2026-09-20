import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/connectDB.js";
import Lookup from "../models/lookup/lookup.model.js";

export const initialLookups = [
  // GENDER
  { category: "GENDER", code: "MALE", label: "Male", sortOrder: 1 },
  { category: "GENDER", code: "FEMALE", label: "Female", sortOrder: 2 },
  { category: "GENDER", code: "OTHER", label: "Other", sortOrder: 3 },

  // MARITAL_STATUS
  { category: "MARITAL_STATUS", code: "SINGLE", label: "Single", sortOrder: 1 },
  { category: "MARITAL_STATUS", code: "MARRIED", label: "Married", sortOrder: 2 },
  { category: "MARITAL_STATUS", code: "DIVORCED", label: "Divorced", sortOrder: 3 },
  { category: "MARITAL_STATUS", code: "WIDOWED", label: "Widowed", sortOrder: 4 },

  // BLOOD_GROUP
  { category: "BLOOD_GROUP", code: "A_POS", label: "A+", sortOrder: 1 },
  { category: "BLOOD_GROUP", code: "A_NEG", label: "A-", sortOrder: 2 },
  { category: "BLOOD_GROUP", code: "B_POS", label: "B+", sortOrder: 3 },
  { category: "BLOOD_GROUP", code: "B_NEG", label: "B-", sortOrder: 4 },
  { category: "BLOOD_GROUP", code: "AB_POS", label: "AB+", sortOrder: 5 },
  { category: "BLOOD_GROUP", code: "AB_NEG", label: "AB-", sortOrder: 6 },
  { category: "BLOOD_GROUP", code: "O_POS", label: "O+", sortOrder: 7 },
  { category: "BLOOD_GROUP", code: "O_NEG", label: "O-", sortOrder: 8 },

  // CONTACT_CATEGORY
  { category: "CONTACT_CATEGORY", code: "SOCIAL_MEDIA", label: "Social Media", sortOrder: 1 },
  { category: "CONTACT_CATEGORY", code: "EMERGENCY", label: "Emergency Contact", sortOrder: 2 },
  { category: "CONTACT_CATEGORY", code: "PHONE", label: "Contact Number", sortOrder: 3 },

  // PHONE_TYPE
  { category: "PHONE_TYPE", code: "PTCL", label: "PTCL", sortOrder: 1 },
  { category: "PHONE_TYPE", code: "WORK", label: "Work", sortOrder: 2 },
  { category: "PHONE_TYPE", code: "MOBILE_SET", label: "Mobile", sortOrder: 3 },

  // SOCIAL_PLATFORM
  { category: "SOCIAL_PLATFORM", code: "EMAIL", label: "Email", sortOrder: 1 },
  { category: "SOCIAL_PLATFORM", code: "WHATSAPP", label: "WhatsApp", sortOrder: 2 },
  { category: "SOCIAL_PLATFORM", code: "FACEBOOK", label: "Facebook", sortOrder: 3 },
  { category: "SOCIAL_PLATFORM", code: "LINKEDIN", label: "LinkedIn", sortOrder: 4 },
  { category: "SOCIAL_PLATFORM", code: "TWITTER", label: "Twitter / X", sortOrder: 5 },
  { category: "SOCIAL_PLATFORM", code: "OTHER", label: "Other", sortOrder: 6 },

  // EMERGENCY_TYPE
  { category: "EMERGENCY_TYPE", code: "OFFICE", label: "Office", sortOrder: 1 },
  { category: "EMERGENCY_TYPE", code: "RESIDENCE", label: "Residence", sortOrder: 2 },
  { category: "EMERGENCY_TYPE", code: "PERSONAL", label: "Personal", sortOrder: 3 },

  // PROFICIENCY_LEVEL
  { category: "PROFICIENCY_LEVEL", code: "LOW", label: "Low", sortOrder: 1 },
  { category: "PROFICIENCY_LEVEL", code: "AVERAGE", label: "Average", sortOrder: 2 },
  { category: "PROFICIENCY_LEVEL", code: "HIGH", label: "High", sortOrder: 3 },

  // PASSPORT_TYPE
  { category: "PASSPORT_TYPE", code: "LOCAL", label: "Local", sortOrder: 1 },
  { category: "PASSPORT_TYPE", code: "FOREIGN", label: "Foreign", sortOrder: 2 },

  // NATIONALITY_STATUS
  { category: "NATIONALITY_STATUS", code: "ACTIVE", label: "Active", sortOrder: 1 },
  { category: "NATIONALITY_STATUS", code: "REVOKED", label: "Revoked", sortOrder: 2 },
  { category: "NATIONALITY_STATUS", code: "RENOUNCED", label: "Renounced", sortOrder: 3 },
  { category: "NATIONALITY_STATUS", code: "DUAL", label: "Dual Citizen", sortOrder: 4 },
];

export const seedLookups = async (options = { isStandalone: false }) => {
  try {
    if (options.isStandalone) {
      console.log("Connecting to Database...");
      await connectDB();
    }

    const operations = initialLookups.map((item) => ({
      updateOne: {
        filter: { category: item.category, code: item.code },
        update: { $set: item },
        upsert: true,
      },
    }));

    const result = await Lookup.bulkWrite(operations);
    console.log(
      `🌱 Master lookups synchronized. Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}, Total: ${operations.length}`
    );

    if (options.isStandalone) {
      process.exit(0);
    }
    return result;
  } catch (error) {
    console.error("❌ Error synchronizing lookups:", error);
    if (options.isStandalone) {
      process.exit(1);
    }
    throw error;
  }
};

// Auto-run if executed directly via CLI
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("lookup.seed.js")) {
  seedLookups({ isStandalone: true });
}

export default seedLookups;
