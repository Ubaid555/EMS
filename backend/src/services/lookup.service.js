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
    console.log(
      `⚡ [Lookup Cache Warm] Loaded ${allLookups.length} options across ${lookupCache.size} categories into RAM memory.`
    );
    return true;
  } catch (error) {
    console.error("❌ Failed to initialize Lookup Cache:", error);
    return false;
  }
};

/**
 * Ensure cache is populated on first request if server started without warm-up
 */
export const ensureCacheInitialized = async () => {
  if (!isInitialized) {
    console.log("ℹ️ [Lookup Cache] Cache not initialized, warming up from DB now...");
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
  const exists = categoryMap ? categoryMap.has(cd) : false;
  console.log(
    `🔍 [Lookup Cache Check] ${cat}: '${cd}' exists? ${exists ? "YES" : "NO"} (Source: RAM)`
  );
  return exists;
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

  const categoryMap = lookupCache.get(cat);

  // 1. Check if category and code exist at all
  if (!categoryMap || !categoryMap.has(incoming)) {
    const allowed =
      categoryMap && categoryMap.size > 0
        ? Array.from(categoryMap.keys()).join(", ")
        : "No options found. Master lookups may not be initialized.";
    console.log(
      `❌ [Lookup Cache MISS] Category '${cat}', Code '${incoming}' NOT found in RAM. Available in category (${categoryMap?.size || 0}): ${
        categoryMap ? Array.from(categoryMap.keys()).slice(0, 6).join(", ") : "none"
      }`
    );
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
      console.log(
        `⚠️ [Lookup Cache INACTIVE] ${cat}: '${incoming}' is deactivated in RAM.`
      );
      throw new ApiError(
        400,
        `Option '${incoming}' for ${cat} is inactive/discontinued and cannot be selected for new changes.`
      );
    }
  }

  console.log(
    `✅ [Lookup Cache HIT] Validated ${cat}: '${incoming}' (${itemData.label}) directly from RAM [0ms, 0 DB queries]. Total options in ${cat}: ${categoryMap.size}`
  );

  return true;
};

/**
 * Diagnostic summary of RAM cache content
 */
export const getLookupCacheSummary = () => {
  const categoryCounts = {};
  for (const [cat, map] of lookupCache.entries()) {
    categoryCounts[cat] = map.size;
  }
  return {
    isInitialized,
    totalCategories: lookupCache.size,
    categoryCounts,
  };
};

export default {
  refreshLookupCache,
  ensureCacheInitialized,
  isCodeValid,
  isCodeActive,
  validateLookupField,
  getLookupCacheSummary,
};
