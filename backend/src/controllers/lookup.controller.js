import Lookup from "../models/lookup/lookup.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { refreshLookupCache } from "../services/lookup.service.js";

/**
 * =========================================
 * Get Lookups by Category (with cascading parent support)
 * GET /api/v1/lookups?category=CITY&parent=123
 * =========================================
 */
export const getLookups = asyncHandler(async (req, res) => {
  const { category, parent, includeInactive } = req.query;

  const query = {};

  if (category) {
    query.category = category.trim().toUpperCase();
  }

  if (parent !== undefined) {
    query.parent = parent === "null" || parent === "" ? null : parent;
  }

  if (includeInactive !== "true") {
    query.isActive = true;
  }

  const lookups = await Lookup.find(query)
    .sort({ sortOrder: 1, label: 1 })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, lookups, "Lookups retrieved successfully."));
});

/**
 * =========================================
 * Bulk Fetch Lookups for Multiple Dropdowns in 1 Request
 * GET /api/v1/lookups/bulk?categories=GENDER,MARITAL_STATUS,BLOOD_GROUP
 * =========================================
 */
export const getBulkLookups = asyncHandler(async (req, res) => {
  const { categories, includeInactive } = req.query;

  if (!categories) {
    throw new ApiError(400, "Categories query parameter is required (comma-separated).");
  }

  const categoryList = categories
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);

  if (categoryList.length === 0) {
    throw new ApiError(400, "At least one category must be provided.");
  }

  const query = {
    category: { $in: categoryList },
  };

  if (includeInactive !== "true") {
    query.isActive = true;
  }

  const lookups = await Lookup.find(query)
    .sort({ sortOrder: 1, label: 1 })
    .lean();

  // Group by category: { GENDER: [...], MARITAL_STATUS: [...] }
  const grouped = {};
  for (const cat of categoryList) {
    grouped[cat] = [];
  }

  for (const item of lookups) {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, grouped, "Bulk lookups retrieved successfully."));
});

/**
 * =========================================
 * Get All Distinct Category Names
 * GET /api/v1/lookups/categories
 * =========================================
 */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Lookup.distinct("category");
  categories.sort();

  return res
    .status(200)
    .json(new ApiResponse(200, categories, "Categories retrieved successfully."));
});

/**
 * =========================================
 * Create a Single Lookup
 * POST /api/v1/lookups
 * =========================================
 */
export const createLookup = asyncHandler(async (req, res) => {
  const { category, code, label, sortOrder, isActive, parent, metadata } = req.body;

  if (!category || !code || !label) {
    throw new ApiError(400, "Category, code, and label are required fields.");
  }

  const normalizedCategory = category.trim().toUpperCase();
  const normalizedCode = code.trim().toUpperCase();

  const existing = await Lookup.findOne({
    category: normalizedCategory,
    code: normalizedCode,
  });

  if (existing) {
    throw new ApiError(409, `Lookup with code '${normalizedCode}' already exists in category '${normalizedCategory}'.`);
  }

  const lookup = await Lookup.create({
    category: normalizedCategory,
    code: normalizedCode,
    label: label.trim(),
    sortOrder: sortOrder ?? 0,
    isActive: isActive ?? true,
    parent: parent || null,
    metadata: metadata || {},
  });

  // Keep in-memory cache synchronized immediately
  await refreshLookupCache();

  return res
    .status(201)
    .json(new ApiResponse(201, lookup, "Lookup created successfully."));
});

/**
 * =========================================
 * Bulk Create / Seed Lookups
 * POST /api/v1/lookups/bulk
 * =========================================
 */
export const bulkCreateLookups = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Items array is required and must not be empty.");
  }

  const operations = items.map((item) => ({
    updateOne: {
      filter: {
        category: item.category.trim().toUpperCase(),
        code: item.code.trim().toUpperCase(),
      },
      update: {
        $set: {
          category: item.category.trim().toUpperCase(),
          code: item.code.trim().toUpperCase(),
          label: item.label.trim(),
          sortOrder: item.sortOrder ?? 0,
          isActive: item.isActive ?? true,
          parent: item.parent || null,
          metadata: item.metadata || {},
        },
      },
      upsert: true,
    },
  }));

  const result = await Lookup.bulkWrite(operations);

  // Keep in-memory cache synchronized immediately
  await refreshLookupCache();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          upsertedCount: result.upsertedCount,
          modifiedCount: result.modifiedCount,
          matchedCount: result.matchedCount,
        },
        "Bulk lookups processed successfully."
      )
    );
});

/**
 * =========================================
 * Update a Lookup
 * PUT /api/v1/lookups/:id
 * =========================================
 */
export const updateLookup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { label, sortOrder, isActive, parent, metadata } = req.body;

  const lookup = await Lookup.findById(id);

  if (!lookup) {
    throw new ApiError(404, "Lookup not found.");
  }

  if (label !== undefined) lookup.label = label.trim();
  if (sortOrder !== undefined) lookup.sortOrder = sortOrder;
  if (isActive !== undefined) lookup.isActive = isActive;
  if (parent !== undefined) lookup.parent = parent || null;
  if (metadata !== undefined) lookup.metadata = metadata;

  await lookup.save();

  // Keep in-memory cache synchronized immediately
  await refreshLookupCache();

  return res
    .status(200)
    .json(new ApiResponse(200, lookup, "Lookup updated successfully."));
});

/**
 * =========================================
 * Toggle Active Status
 * PATCH /api/v1/lookups/:id/toggle
 * =========================================
 */
export const toggleLookupStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lookup = await Lookup.findById(id);

  if (!lookup) {
    throw new ApiError(404, "Lookup not found.");
  }

  lookup.isActive = !lookup.isActive;
  await lookup.save();

  // Keep in-memory cache synchronized immediately
  await refreshLookupCache();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        lookup,
        `Lookup ${lookup.isActive ? "activated" : "deactivated"} successfully.`
      )
    );
});
