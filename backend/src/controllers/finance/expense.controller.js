import HomeExpense from "../../models/finance/homeExpense.model.js";
import OtherExpense from "../../models/finance/otherExpense.model.js";
import Income from "../../models/finance/income.model.js";
import { getLookupId } from "../../services/lookup.service.js";
import versionedCrud from "../../services/versionedCrud.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

/**
 * =========================================================================
 * Expense Controller (Home & Other Expenses + Consolidated Summary)
 * =========================================================================
 */

// -------------------------------------------------------------------------
// 1. HOME EXPENSES
// -------------------------------------------------------------------------

/**
 * Get all active home expenses (paginated, searchable, filterable by year)
 * GET /api/v1/finance/expenses/home
 */
export const getHomeExpenses = asyncHandler(async (req, res) => {
  const baseFilter = {};
  if (req.query.year) {
    baseFilter.year = String(req.query.year).trim().toUpperCase();
  }

  const { data, pagination } = await versionedCrud.getMultiActive(
    HomeExpense,
    req.employee._id,
    req.query,
    {
      baseFilter,
      defaultSearchFields: ["title", "year", "amount", "notes"],
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Home expenses retrieved successfully.", pagination));
});

/**
 * Add a new home expense
 * POST /api/v1/finance/expenses/home
 */
export const addHomeExpense = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  if (payload.year) {
    payload.year = String(payload.year).trim().toUpperCase();
    payload.yearLookup = getLookupId("YEAR", payload.year) || null;
  }

  const result = await versionedCrud.createMulti(
    HomeExpense,
    req.employee._id,
    payload,
    req.employee._id
  );

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Home expense added successfully."));
});

/**
 * Update an existing home expense (generates a new version, preserves audit history)
 * PUT /api/v1/finance/expenses/home/:id
 */
export const updateHomeExpense = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  if (payload.year) {
    payload.year = String(payload.year).trim().toUpperCase();
    payload.yearLookup = getLookupId("YEAR", payload.year) || null;
  }

  const result = await versionedCrud.updateMulti(
    HomeExpense,
    req.employee._id,
    req.params.id,
    payload,
    req.employee._id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Home expense updated successfully."));
});

/**
 * Soft-delete a home expense item (creates tombstone)
 * DELETE /api/v1/finance/expenses/home/:id
 */
export const deleteHomeExpense = asyncHandler(async (req, res) => {
  await versionedCrud.deleteMulti(
    HomeExpense,
    req.employee._id,
    req.params.id,
    req.employee._id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Home expense removed successfully."));
});

/**
 * Get version history of a specific home expense item
 * GET /api/v1/finance/expenses/home/:id/history
 */
export const getHomeExpenseItemHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiItemHistory(
    HomeExpense,
    req.employee._id,
    req.params.id,
    req.query,
    {
      defaultSearchFields: ["title", "year", "amount", "notes", "actionType"],
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        data,
        "Home expense version history retrieved successfully.",
        pagination
      )
    );
});

/**
 * Get full chronological history of all home expense actions
 * GET /api/v1/finance/expenses/home/history/all
 */
export const getAllHomeExpensesHistory = asyncHandler(async (req, res) => {
  const baseFilter = {};
  if (req.query.year) {
    baseFilter.year = String(req.query.year).trim().toUpperCase();
  }

  const { data, pagination } = await versionedCrud.getMultiAllHistory(
    HomeExpense,
    req.employee._id,
    req.query,
    {
      baseFilter,
      defaultSearchFields: ["title", "year", "amount", "notes", "actionType"],
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        data,
        "Full home expense audit history retrieved successfully.",
        pagination
      )
    );
});

// -------------------------------------------------------------------------
// 2. OTHER EXPENSES
// -------------------------------------------------------------------------

/**
 * Get all active other expenses (paginated, searchable, filterable by year)
 * GET /api/v1/finance/expenses/other
 */
export const getOtherExpenses = asyncHandler(async (req, res) => {
  const baseFilter = {};
  if (req.query.year) {
    baseFilter.year = String(req.query.year).trim().toUpperCase();
  }

  const { data, pagination } = await versionedCrud.getMultiActive(
    OtherExpense,
    req.employee._id,
    req.query,
    {
      baseFilter,
      defaultSearchFields: ["title", "year", "amount", "notes"],
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Other expenses retrieved successfully.", pagination));
});

/**
 * Add a new other expense
 * POST /api/v1/finance/expenses/other
 */
export const addOtherExpense = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  if (payload.year) {
    payload.year = String(payload.year).trim().toUpperCase();
    payload.yearLookup = getLookupId("YEAR", payload.year) || null;
  }

  const result = await versionedCrud.createMulti(
    OtherExpense,
    req.employee._id,
    payload,
    req.employee._id
  );

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Other expense added successfully."));
});

/**
 * Update an existing other expense (generates a new version, preserves audit history)
 * PUT /api/v1/finance/expenses/other/:id
 */
export const updateOtherExpense = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  if (payload.year) {
    payload.year = String(payload.year).trim().toUpperCase();
    payload.yearLookup = getLookupId("YEAR", payload.year) || null;
  }

  const result = await versionedCrud.updateMulti(
    OtherExpense,
    req.employee._id,
    req.params.id,
    payload,
    req.employee._id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Other expense updated successfully."));
});

/**
 * Soft-delete an other expense item (creates tombstone)
 * DELETE /api/v1/finance/expenses/other/:id
 */
export const deleteOtherExpense = asyncHandler(async (req, res) => {
  await versionedCrud.deleteMulti(
    OtherExpense,
    req.employee._id,
    req.params.id,
    req.employee._id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Other expense removed successfully."));
});

/**
 * Get version history of a specific other expense item
 * GET /api/v1/finance/expenses/other/:id/history
 */
export const getOtherExpenseItemHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiItemHistory(
    OtherExpense,
    req.employee._id,
    req.params.id,
    req.query,
    {
      defaultSearchFields: ["title", "year", "amount", "notes", "actionType"],
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        data,
        "Other expense version history retrieved successfully.",
        pagination
      )
    );
});

/**
 * Get full chronological history of all other expense actions
 * GET /api/v1/finance/expenses/other/history/all
 */
export const getAllOtherExpensesHistory = asyncHandler(async (req, res) => {
  const baseFilter = {};
  if (req.query.year) {
    baseFilter.year = String(req.query.year).trim().toUpperCase();
  }

  const { data, pagination } = await versionedCrud.getMultiAllHistory(
    OtherExpense,
    req.employee._id,
    req.query,
    {
      baseFilter,
      defaultSearchFields: ["title", "year", "amount", "notes", "actionType"],
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        data,
        "Full other expense audit history retrieved successfully.",
        pagination
      )
    );
});

// -------------------------------------------------------------------------
// 3. CONSOLIDATED FINANCE SUMMARY
// -------------------------------------------------------------------------

/**
 * Get consolidated financial summary (Incomes, Home Expenses, Other Expenses, Net Savings)
 * GET /api/v1/finance/summary?year=2025
 */
export const getFinanceSummary = asyncHandler(async (req, res) => {
  const filter = {
    employeeId: req.employee._id,
    isCurrent: true,
    isDeleted: false,
  };

  if (req.query.year) {
    filter.year = String(req.query.year).trim().toUpperCase();
  }

  const [incomes, homeExpenses, otherExpenses] = await Promise.all([
    Income.find(filter).lean(),
    HomeExpense.find(filter).lean(),
    OtherExpense.find(filter).lean(),
  ]);

  const totalIncome = incomes.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalHomeExpenses = homeExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalOtherExpenses = otherExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalExpenses = totalHomeExpenses + totalOtherExpenses;
  const netSavings = totalIncome - totalExpenses;

  const summary = {
    year: req.query.year ? String(req.query.year).trim().toUpperCase() : "ALL",
    totalIncome,
    totalExpenses,
    totalHomeExpenses,
    totalOtherExpenses,
    netSavings,
    counts: {
      incomes: incomes.length,
      homeExpenses: homeExpenses.length,
      otherExpenses: otherExpenses.length,
      totalEntries: incomes.length + homeExpenses.length + otherExpenses.length,
    },
    incomes,
    homeExpenses,
    otherExpenses,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, summary, "Finance summary retrieved successfully."));
});

export default {
  getHomeExpenses,
  addHomeExpense,
  updateHomeExpense,
  deleteHomeExpense,
  getHomeExpenseItemHistory,
  getAllHomeExpensesHistory,
  getOtherExpenses,
  addOtherExpense,
  updateOtherExpense,
  deleteOtherExpense,
  getOtherExpenseItemHistory,
  getAllOtherExpensesHistory,
  getFinanceSummary,
};
