import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/connectDB.js";
import Lookup from "../models/lookup/lookup.model.js";
import {
  geoCountries,
  geoStates,
  geoDistricts,
  geoCities,
  geoTowns,
} from "./geoLookups.data.js";

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
  { category: "PHONE_TYPE", code: "MOBILE", label: "Mobile", sortOrder: 1 },
  { category: "PHONE_TYPE", code: "PTCL", label: "PTCL", sortOrder: 2 },
  { category: "PHONE_TYPE", code: "VPTCL", label: "V-PTCL (Wireless PTCL)", sortOrder: 3 },

  // SOCIAL_PLATFORM
  { category: "SOCIAL_PLATFORM", code: "EMAIL", label: "Email", sortOrder: 1 },
  { category: "SOCIAL_PLATFORM", code: "WHATSAPP", label: "WhatsApp", sortOrder: 2 },
  { category: "SOCIAL_PLATFORM", code: "FACEBOOK", label: "Facebook", sortOrder: 3 },
  { category: "SOCIAL_PLATFORM", code: "LINKEDIN", label: "LinkedIn", sortOrder: 4 },
  { category: "SOCIAL_PLATFORM", code: "TWITTER", label: "Twitter / X", sortOrder: 5 },
  { category: "SOCIAL_PLATFORM", code: "INSTAGRAM", label: "Instagram", sortOrder: 6 },
  { category: "SOCIAL_PLATFORM", code: "OTHER", label: "Other", sortOrder: 7 },

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

    // 1. General Lookups
    const generalOps = initialLookups.map((item) => ({
      updateOne: {
        filter: { category: item.category, code: item.code },
        update: { $set: item },
        upsert: true,
      },
    }));
    await Lookup.bulkWrite(generalOps);

    // 2. Countries (Level 1, parent: null)
    const countryOps = geoCountries.map((item) => ({
      updateOne: {
        filter: { category: item.category, code: item.code },
        update: { $set: { ...item, parent: null } },
        upsert: true,
      },
    }));
    await Lookup.bulkWrite(countryOps);

    // Fetch Countries to map code -> _id
    const countries = await Lookup.find({ category: "COUNTRY" }).select("_id code").lean();
    const countryMap = new Map(countries.map((c) => [c.code, c._id]));

    // Clean up any legacy unscoped state codes
    await Lookup.deleteMany({
      category: "STATE",
      code: { $in: ["PUNJAB", "SINDH", "KPK", "BALOCHISTAN", "ISLAMABAD", "AJK", "GILGIT_BALTISTAN"] },
    });

    // 3. States / Provinces (Level 2, parent: country._id)
    const stateOps = geoStates.map((item) => {
      const parentId = countryMap.get(item.parentCode) || null;
      const { parentCode, ...doc } = item;
      return {
        updateOne: {
          filter: { category: doc.category, code: doc.code },
          update: { $set: { ...doc, parent: parentId } },
          upsert: true,
        },
      };
    });
    await Lookup.bulkWrite(stateOps);

    // Fetch States to map code -> _id
    const states = await Lookup.find({ category: "STATE" }).select("_id code").lean();
    const stateMap = new Map(states.map((s) => [s.code, s._id]));

    // 4. Districts (Level 3, parent: state._id)
    const districtOps = geoDistricts.map((item) => {
      const parentId = stateMap.get(item.parentCode) || null;
      const { parentCode, ...doc } = item;
      return {
        updateOne: {
          filter: { category: doc.category, code: doc.code },
          update: { $set: { ...doc, parent: parentId } },
          upsert: true,
        },
      };
    });
    await Lookup.bulkWrite(districtOps);

    // Fetch Districts to map code -> _id
    const districts = await Lookup.find({ category: "DISTRICT" }).select("_id code").lean();
    const districtMap = new Map(districts.map((d) => [d.code, d._id]));

    // 5. Cities (Level 4, parent: district._id)
    const cityOps = geoCities.map((item) => {
      const parentId = districtMap.get(item.parentCode) || null;
      const { parentCode, ...doc } = item;
      return {
        updateOne: {
          filter: { category: doc.category, code: doc.code },
          update: { $set: { ...doc, parent: parentId } },
          upsert: true,
        },
      };
    });
    await Lookup.bulkWrite(cityOps);

    // Fetch Cities to map code -> _id
    const cities = await Lookup.find({ category: "CITY" }).select("_id code").lean();
    const cityMap = new Map(cities.map((c) => [c.code, c._id]));

    // 6. Towns (Level 5, parent: city._id)
    const townOps = geoTowns.map((item) => {
      const parentId = cityMap.get(item.parentCode) || null;
      const { parentCode, ...doc } = item;
      return {
        updateOne: {
          filter: { category: doc.category, code: doc.code },
          update: { $set: { ...doc, parent: parentId } },
          upsert: true,
        },
      };
    });
    await Lookup.bulkWrite(townOps);

    const totalCount =
      initialLookups.length +
      geoCountries.length +
      geoStates.length +
      geoDistricts.length +
      geoCities.length +
      geoTowns.length;

    console.log(
      `🌱 Master lookups & Geographic hierarchy synchronized. (Total: ${totalCount} records)`
    );

    if (options.isStandalone) {
      process.exit(0);
    }
    return true;
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
