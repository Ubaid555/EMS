import apiClient from './api.client';

/**
 * In-memory Lookup Cache
 * Key: category or `category:parentId`
 * Value: { data: Array, timestamp: number }
 */
const lookupCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

export const lookupService = {
  /**
   * Fetch lookups by category (with optional cascading parent ID or parent Code)
   * GET /api/v1/lookups?category=...&parent=...
   */
  async getByCategory(category, parentId = null, forceRefresh = false) {
    if (!category) return [];

    const normalizedCategory = category.trim().toUpperCase();
    const cacheKey = parentId
      ? `${normalizedCategory}:${parentId}`
      : normalizedCategory;

    // Check cache if not forcing refresh
    if (!forceRefresh && lookupCache.has(cacheKey)) {
      const cached = lookupCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
      }
    }

    const params = { category: normalizedCategory };
    if (parentId) {
      params.parent = parentId;
    }

    const res = await apiClient.get('/lookups', { params });
    const data = res?.data || [];

    // Store in cache
    lookupCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  },

  /**
   * Fetch multiple lookup categories in 1 bulk network request
   * GET /api/v1/lookups/bulk?categories=GENDER,MARITAL_STATUS,YEAR
   */
  async getBulk(categories = []) {
    if (!categories.length) return {};

    const joined = categories.map((c) => c.toUpperCase()).join(',');
    const res = await apiClient.get('/lookups/bulk', {
      params: { categories: joined },
    });

    const result = res?.data || {};

    // Cache each category received
    Object.entries(result).forEach(([cat, items]) => {
      lookupCache.set(cat, { data: items, timestamp: Date.now() });
    });

    return result;
  },

  /**
   * Fetch all active lookup categories registered in the system
   * GET /api/v1/lookups/categories
   */
  async getCategories() {
    const res = await apiClient.get('/lookups/categories');
    return res?.data || [];
  },

  /**
   * Clear cache (e.g. after adding new lookups in admin panel)
   */
  clearCache() {
    lookupCache.clear();
  },
};

export default lookupService;
