/**
 * =========================================================================
 * Universal Query & Pagination Helper Utility
 * =========================================================================
 * Provides robust pagination, dynamic multi-field search with regex escaping,
 * whitelist field protection, sorting, and standardized pagination metadata.
 */

/**
 * Escapes special characters for use in regular expressions to prevent ReDoS / syntax errors.
 *
 * @param {string} string - Raw user search input
 * @returns {string} Regex-escaped string
 */
export const escapeRegex = (string) => {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Parses and validates pagination and sorting parameters from req.query.
 *
 * @param {object} queryParams - Express req.query object
 * @param {object} defaults - Fallback values for pagination and sorting
 * @returns {object} { page, limit, skip, isAll, sortBy, sortOrder }
 */
export const parsePaginationParams = (queryParams = {}, defaults = {}) => {
  const isAll =
    queryParams.pagination === "false" ||
    queryParams.limit === "all" ||
    queryParams.all === "true";

  const page = Math.max(1, parseInt(queryParams.page, 10) || defaults.page || 1);
  const requestedLimit = parseInt(queryParams.limit, 10);

  // Default limit 10, min 1, max 100 per page to safeguard server performance
  const limit = isAll
    ? 0
    : Math.min(100, Math.max(1, requestedLimit || defaults.limit || 10));

  const skip = isAll ? 0 : (page - 1) * limit;

  const sortBy = queryParams.sortBy || defaults.sortBy || "createdAt";
  const sortOrder =
    (queryParams.sortOrder || defaults.sortOrder || "desc").toLowerCase() ===
    "asc"
      ? 1
      : -1;

  return {
    page,
    limit,
    skip,
    isAll,
    sortBy,
    sortOrder,
  };
};

/**
 * Constructs a dynamic MongoDB $or search filter across specified or default fields.
 * Handles both String fields (case-insensitive regex) and Number fields (partial
 * string match via $toString and exact equality for indexed lookups).
 *
 * @param {object} queryParams - Express req.query object (contains search / q & searchFields)
 * @param {string[]} defaultSearchFields - Model-specific default fields to query if frontend omits searchFields
 * @param {string[]|null} allowedFields - Optional whitelist of allowed searchable fields
 * @param {import("mongoose").Model|null} Model - Mongoose model to introspect field data types
 * @returns {object} MongoDB query condition (e.g. { $or: [...] } or {})
 */
export const buildSearchFilter = (
  queryParams = {},
  defaultSearchFields = [],
  allowedFields = null,
  Model = null
) => {
  const rawSearch = (queryParams.search || queryParams.q || "").trim();
  if (!rawSearch) return {};

  let targetFields = [];

  const rawFields = queryParams.searchFields || queryParams.fields;
  if (Array.isArray(rawFields)) {
    targetFields = rawFields;
  } else if (typeof rawFields === "string" && rawFields.trim()) {
    targetFields = rawFields
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
  } else if (Array.isArray(defaultSearchFields) && defaultSearchFields.length > 0) {
    targetFields = defaultSearchFields;
  }

  // Filter against allowedFields whitelist if provided
  if (Array.isArray(allowedFields) && allowedFields.length > 0) {
    targetFields = targetFields.filter((f) => allowedFields.includes(f));
  }

  // Disallow forbidden/system keys to prevent injection
  targetFields = targetFields.filter(
    (f) =>
      !f.startsWith("$") &&
      !f.startsWith("_") &&
      f !== "password" &&
      f !== "refreshToken"
  );

  if (targetFields.length === 0) return {};

  const escaped = escapeRegex(rawSearch);
  const regex = new RegExp(escaped, "i");
  const num = Number(rawSearch);
  const isNum = !isNaN(num) && rawSearch.trim() !== "";

  const orConditions = [];

  for (const field of targetFields) {
    const pathType = Model?.schema?.path(field)?.instance;

    if (pathType === "Number") {
      // 1. Partial string match on the numeric field (e.g. "17" matches 175)
      orConditions.push({
        $expr: {
          $regexMatch: {
            input: { $ifNull: [{ $toString: `$${field}` }, ""] },
            regex: escaped,
            options: "i",
          },
        },
      });
      // 2. Exact numeric equality for indexed B-tree searches
      if (isNum) {
        orConditions.push({ [field]: num });
      }
    } else if (pathType === "String") {
      orConditions.push({ [field]: regex });
    } else {
      // Untyped or dynamic field (e.g. nested subdocuments or loose schema)
      // Supports string regex, partial numeric string matching, and exact numeric equality
      orConditions.push({ [field]: regex });
      orConditions.push({
        $expr: {
          $regexMatch: {
            input: { $ifNull: [{ $toString: `$${field}` }, ""] },
            regex: escaped,
            options: "i",
          },
        },
      });
      if (isNum) {
        orConditions.push({ [field]: num });
      }
    }
  }

  if (orConditions.length === 0) return {};
  return orConditions.length === 1 ? orConditions[0] : { $or: orConditions };
};

/**
 * Standardized pagination executor that merges base filters with dynamic multi-field search,
 * executes parallel queries for data and count, and returns { data, pagination }.
 *
 * @param {import("mongoose").Model} Model - Mongoose collection model
 * @param {object} baseFilter - Core query filter (e.g. { employeeId, isCurrent: true, isDeleted: false })
 * @param {object} queryParams - Express req.query object
 * @param {object} options - Configuration options (defaultSearchFields, populate, select, defaultSortBy, defaultSortOrder)
 * @returns {Promise<{ data: any[], pagination: object }>}
 */
export const paginateQuery = async (
  Model,
  baseFilter = {},
  queryParams = {},
  options = {}
) => {
  const {
    defaultSearchFields = [],
    allowedFields = null,
    populate = null,
    select = null,
    defaultSortBy = "createdAt",
    defaultSortOrder = "desc",
  } = options;

  const { page, limit, skip, isAll, sortBy, sortOrder } = parsePaginationParams(
    queryParams,
    { sortBy: defaultSortBy, sortOrder: defaultSortOrder }
  );

  const searchFilter = buildSearchFilter(
    queryParams,
    defaultSearchFields,
    allowedFields,
    Model
  );

  // Merge baseFilter and searchFilter safely
  let finalFilter = baseFilter;
  if (Object.keys(searchFilter).length > 0) {
    finalFilter = {
      $and: [baseFilter, searchFilter],
    };
  }

  // Build the find query
  let findQuery = Model.find(finalFilter).sort({ [sortBy]: sortOrder });

  if (!isAll) {
    findQuery = findQuery.skip(skip).limit(limit);
  }

  if (populate) {
    findQuery = findQuery.populate(populate);
  }

  if (select) {
    findQuery = findQuery.select(select);
  }

  // Parallel execution for maximum performance
  const [data, totalDocs] = await Promise.all([
    findQuery.lean(),
    Model.countDocuments(finalFilter),
  ]);

  const effectiveLimit = isAll ? totalDocs : limit;
  const totalPages = isAll
    ? 1
    : Math.max(1, Math.ceil(totalDocs / (effectiveLimit || 1)));

  const hasNextPage = !isAll && page < totalPages;
  const hasPrevPage = !isAll && page > 1;

  const pagination = {
    page: isAll ? 1 : page,
    limit: effectiveLimit,
    totalDocs,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null,
  };

  return {
    data,
    pagination,
  };
};

export default {
  escapeRegex,
  parsePaginationParams,
  buildSearchFilter,
  paginateQuery,
};
