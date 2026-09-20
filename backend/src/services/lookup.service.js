import Lookup from "../models/lookup/lookup.model.js";
import ApiError from "../utils/ApiError.js";

/**
 * =========================================
 * In-Memory Master Lookup Cache & Validator
 * =========================================
 * Structure:
 * {
 *   GENDER: {
 *     MALE: { isActive: true, label: "Male", id: "..." },
 *     FEMALE: { isActive: true, label: "Female", id: "..." }
 *   }
 * }
 */
const lookupCache = new Map();
let isInitialized = false;

/**
 * Populate or refresh the in-memory lookup cache from MongoDB
 */
export const refreshLookupCache = async () => {
  try {
    const allLookups = await Lookup.find({}).lean();

    lookupCache.clear();

    for (const item of allLookups) {
      const cat = item.category.toUpperCase();
      const code = item.code.toUpperCase();

      if (!lookupCache.has(cat)) {
        lookupCache.set(cat, new Map());
      }

      lookupCache.get(cat).set(code, {
        id: item._id,
        label: item.label,
        isActive: item.isActive,
        parent: item.parent,
        sortOrder: item.sortOrder,
        metadata: item.metadata,
      });
    }

    isInitialized = true;
    return true;
  } catch (error) {
    console.error("Failed to initialize Lookup Cache:", error);
    return false;
  }
};

/**
 * Ensure cache is populated on first request if server started without warm-up
 */
export const ensureCacheInitialized = async () => {
  if (!isInitialized) {
    await refreshLookupCache();
  }
};

/**
 * Check if a code exists in a category (regardless of active/inactive)
 */
export const isCodeValid = (category, code) => {
  if (!category || !code) return false;
  const cat = category.toUpperCase();
  const cd = code.toUpperCase();
  const categoryMap = lookupCache.get(cat);
  return categoryMap ? categoryMap.has(cd) : false;
};

/**
 * Check if a code exists AND is currently active
 */
export const isCodeActive = (category, code) => {
  if (!category || !code) return false;
  const cat = category.toUpperCase();
  const cd = code.toUpperCase();
  const categoryMap = lookupCache.get(cat);
  if (!categoryMap || !categoryMap.has(cd)) return false;
  return categoryMap.get(cd).isActive === true;
};

/**
 * Validate an incoming lookup code:
 * 1. Checks if the code exists (rejects random malicious input like "ALIEN")
 * 2. If inactive, allows it ONLY if it is an untouched legacy value from an existing record (Grandfathering)
 * 3. Otherwise, enforces that only active codes can be chosen.
 */
export const validateLookupField = (category, incomingCode, existingCode = null) => {
  if (!incomingCode) return true; // Optional fields handled by schema

  const cat = category.toUpperCase();
  const incoming = incomingCode.trim().toUpperCase();

  // If cache is empty (e.g. fresh start before seeder), allow or warm up
  if (!isInitialized || lookupCache.size === 0) {
    return true;
  }

  const categoryMap = lookupCache.get(cat);

  // 1. Check if category and code exist at all
  if (!categoryMap || !categoryMap.has(incoming)) {
    const allowed = categoryMap ? Array.from(categoryMap.keys()).join(", ") : "none defined";
    throw new ApiError(
      400,
      `Invalid ${cat}: '${incoming}'. Valid options are: ${allowed}`
    );
  }

  // 2. Check active status
  const itemData = categoryMap.get(incoming);
  if (!itemData.isActive) {
    const isUntouched = existingCode && existingCode.trim().toUpperCase() === incoming;
    if (!isUntouched) {
      throw new ApiError(
        400,
        `Option '${incoming}' for ${cat} is inactive/discontinued and cannot be selected for new changes.`
      );
    }
  }

  return true;
};

export default {
  refreshLookupCache,
  ensureCacheInitialized,
  isCodeValid,
  isCodeActive,
  validateLookupField,
};
