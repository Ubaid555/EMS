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

  // FINANCIAL / CALENDAR YEAR
  { category: "YEAR", code: "2020", label: "2020", sortOrder: 1 },
  { category: "YEAR", code: "2021", label: "2021", sortOrder: 2 },
  { category: "YEAR", code: "2022", label: "2022", sortOrder: 3 },
  { category: "YEAR", code: "2023", label: "2023", sortOrder: 4 },
  { category: "YEAR", code: "2024", label: "2024", sortOrder: 5 },
  { category: "YEAR", code: "2025", label: "2025", sortOrder: 6 },
  { category: "YEAR", code: "2026", label: "2026", sortOrder: 7 },
  { category: "YEAR", code: "2027", label: "2027", sortOrder: 8 },
  { category: "YEAR", code: "2028", label: "2028", sortOrder: 9 },
  { category: "YEAR", code: "2029", label: "2029", sortOrder: 10 },
  { category: "YEAR", code: "2030", label: "2030", sortOrder: 11 },

  // FAMILY: SPOUSE STATUS
  { category: "SPOUSE_STATUS", code: "MARRIED", label: "Married", sortOrder: 1 },
  { category: "SPOUSE_STATUS", code: "DIVORCED", label: "Divorced", sortOrder: 2 },
  { category: "SPOUSE_STATUS", code: "WIDOWED", label: "Widowed", sortOrder: 3 },
  { category: "SPOUSE_STATUS", code: "SEPARATED", label: "Separated", sortOrder: 4 },

  // FAMILY: DEGREE LEVEL
  { category: "DEGREE_LEVEL", code: "PRIMARY", label: "Primary / Middle", sortOrder: 1 },
  { category: "DEGREE_LEVEL", code: "MATRIC", label: "Matriculation / O-Levels", sortOrder: 2 },
  { category: "DEGREE_LEVEL", code: "INTERMEDIATE", label: "Intermediate / A-Levels", sortOrder: 3 },
  { category: "DEGREE_LEVEL", code: "BACHELORS", label: "Bachelors / Undergraduate", sortOrder: 4 },
  { category: "DEGREE_LEVEL", code: "MASTERS", label: "Masters / Postgraduate", sortOrder: 5 },
  { category: "DEGREE_LEVEL", code: "MPHIL", label: "M.Phil / MS", sortOrder: 6 },
  { category: "DEGREE_LEVEL", code: "PHD", label: "Ph.D. / Doctorate", sortOrder: 7 },
  { category: "DEGREE_LEVEL", code: "DIPLOMA", label: "Diploma / Certificate", sortOrder: 8 },
  { category: "DEGREE_LEVEL", code: "OTHER", label: "Other", sortOrder: 9 },

  // FAMILY: PARENT TYPE
  { category: "PARENT_TYPE", code: "FATHER", label: "Father", sortOrder: 1 },
  { category: "PARENT_TYPE", code: "MOTHER", label: "Mother", sortOrder: 2 },

  // FAMILY: LINEAGE TYPE
  { category: "LINEAGE_TYPE", code: "BIOLOGICAL", label: "Biological (Own)", sortOrder: 1 },
  { category: "LINEAGE_TYPE", code: "ADOPTED", label: "Adopted", sortOrder: 2 },
  { category: "LINEAGE_TYPE", code: "STEP", label: "Step Parent / Child", sortOrder: 3 },

  // FAMILY: CHILD TYPE
  { category: "CHILD_TYPE", code: "BIOLOGICAL", label: "Biological", sortOrder: 1 },
  { category: "CHILD_TYPE", code: "ADOPTED", label: "Adopted", sortOrder: 2 },
  { category: "CHILD_TYPE", code: "STEP_CHILD", label: "Step Child", sortOrder: 3 },

  // FAMILY: CHILD OCCUPATION STATUS
  { category: "CHILD_OCCUPATION_STATUS", code: "STUDENT", label: "Student", sortOrder: 1 },
  { category: "CHILD_OCCUPATION_STATUS", code: "EMPLOYED", label: "Employed", sortOrder: 2 },
  { category: "CHILD_OCCUPATION_STATUS", code: "SELF_EMPLOYED", label: "Self-Employed / Business", sortOrder: 3 },
  { category: "CHILD_OCCUPATION_STATUS", code: "UNEMPLOYED", label: "Unemployed", sortOrder: 4 },

  // FAMILY: STUDY ENROLLMENT STATUS
  { category: "STUDY_STATUS", code: "ENROLLED", label: "Currently Enrolled", sortOrder: 1 },
  { category: "STUDY_STATUS", code: "COMPLETED", label: "Completed", sortOrder: 2 },
  { category: "STUDY_STATUS", code: "DISCONTINUED", label: "Discontinued", sortOrder: 3 },

  // FAMILY: MEDICAL CATEGORY
  { category: "MEDICAL_CATEGORY", code: "CATEGORY_A", label: "Category A (Executive)", sortOrder: 1 },
  { category: "MEDICAL_CATEGORY", code: "CATEGORY_B", label: "Category B (Standard)", sortOrder: 2 },
  { category: "MEDICAL_CATEGORY", code: "CATEGORY_C", label: "Category C (Basic)", sortOrder: 3 },
  { category: "MEDICAL_CATEGORY", code: "DISABILITY", label: "Special Needs / Disability", sortOrder: 4 },

  // FAMILY: ASSET TYPE
  { category: "ASSET_TYPE", code: "AGRICULTURAL_LAND", label: "Agricultural Land", sortOrder: 1 },
  { category: "ASSET_TYPE", code: "RESIDENTIAL_PROPERTY", label: "Residential House / Apartment", sortOrder: 2 },
  { category: "ASSET_TYPE", code: "COMMERCIAL_PROPERTY", label: "Commercial Property / Shop", sortOrder: 3 },
  { category: "ASSET_TYPE", code: "VEHICLE", label: "Vehicle / Automobile", sortOrder: 4 },
  { category: "ASSET_TYPE", code: "BANK_DEPOSIT", label: "Bank Deposits / Savings", sortOrder: 5 },
  { category: "ASSET_TYPE", code: "OTHER", label: "Other Asset", sortOrder: 6 },
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
