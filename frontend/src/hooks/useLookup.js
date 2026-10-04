import { useState, useEffect, useCallback } from 'react';
import lookupService from '@/services/lookup.service';
import { parseApiError } from '@/utils/api-error';

/**
 * Custom Hook for Fetching & Caching System Lookups
 * @param {string} category - E.g. 'GENDER', 'RELATION', 'YEAR', 'CITY'
 * @param {string|null} parentId - Optional parent ID for cascading dropdowns (e.g. Country -> City)
 * @param {object} optionsConfig - Options: { immediate: true, transformLabel: fn }
 */
export function useLookup(category, parentId = null, optionsConfig = {}) {
  const { immediate = true } = optionsConfig;

  const [rawItems, setRawItems] = useState([]);
  const [loading, setLoading] = useState(immediate && Boolean(category));
  const [error, setError] = useState(null);

  const fetchLookups = useCallback(
    async (force = false) => {
      if (!category) {
        setRawItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await lookupService.getByCategory(category, parentId, force);
        setRawItems(data || []);
      } catch (err) {
        const parsed = parseApiError(err);
        setError(parsed.message);
      } finally {
        setLoading(false);
      }
    },
    [category, parentId]
  );

  useEffect(() => {
    if (immediate && category) {
      fetchLookups();
    }
  }, [fetchLookups, immediate, category, parentId]);

  // Transform raw items into standardized options: [{ value, label, code, raw }]
  const options = rawItems.map((item) => ({
    value: item._id,
    label: item.label || item.value || item.code,
    code: item.code,
    raw: item,
  }));

  return {
    options,
    rawItems,
    loading,
    error,
    reload: () => fetchLookups(true),
  };
}

export default useLookup;
