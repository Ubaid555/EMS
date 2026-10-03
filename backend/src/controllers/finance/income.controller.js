import Income from "../../models/finance/income.model.js";
import { getLookupId } from "../../services/lookup.service.js";
import versionedCrud from "../../services/versionedCrud.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

/**
 * =========================================================================
 * Income Controller (Finance Module - SCD Type 2 Audit Chaining)
 * =========================================================================
 */

/**
 * Get all active incomes for the authenticated employee (paginated, searchable, filterable by year)
 * GET /api/v1/finance/incomes
 */
export const getIncomes = asyncHandler(async (req, res) => {
  const baseFilter = {};
  if (req.query.year) {
    baseFilter.year = String(req.query.year).trim().toUpperCase();
  }

  const { data, pagination } = await versionedCrud.getMultiActive(
    Income,
    req.employee._id,
    req.query,
    {
      baseFilter,
      defaultSearchFields: ["title", "source", "year", "amount", "notes"],
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Incomes retrieved successfully.", pagination));
});

/**
 * Add a new income item
 * POST /api/v1/finance/incomes
 */
export const addIncome = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  if (payload.year) {
    payload.year = String(payload.year).trim().toUpperCase();
    payload.yearLookup = getLookupId("YEAR", payload.year) || null;
  }

  const result = await versionedCrud.createMulti(
    Income,
    req.employee._id,
    payload,
    req.employee._id
  );

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Income added successfully."));
});

/**
 * Update an existing income item (generates a new version, preserves audit trail)
 * PUT /api/v1/finance/incomes/:id
 */
export const updateIncome = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  if (payload.year) {
    payload.year = String(payload.year).trim().toUpperCase();
    payload.yearLookup = getLookupId("YEAR", payload.year) || null;
  }

  const result = await versionedCrud.updateMulti(
    Income,
    req.employee._id,
    req.params.id,
    payload,
    req.employee._id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Income updated successfully."));
});

/**
 * Soft-delete an income item (creates tombstone version)
 * DELETE /api/v1/finance/incomes/:id
 */
export const deleteIncome = asyncHandler(async (req, res) => {
  await versionedCrud.deleteMulti(
    Income,
    req.employee._id,
    req.params.id,
    req.employee._id
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Income removed successfully."));
});

/**
 * Get version history of a specific income item
 * GET /api/v1/finance/incomes/:id/history
 */
export const getIncomeItemHistory = asyncHandler(async (req, res) => {
  const { data, pagination } = await versionedCrud.getMultiItemHistory(
    Income,
    req.employee._id,
    req.params.id,
    req.query,
    {
      defaultSearchFields: ["title", "source", "year", "amount", "notes", "actionType"],
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        data,
        "Income item version history retrieved successfully.",
        pagination
      )
    );
});

/**
 * Get full chronological history of all income operations for the employee
 * GET /api/v1/finance/incomes/history/all
 */
export const getAllIncomesHistory = asyncHandler(async (req, res) => {
  const baseFilter = {};
  if (req.query.year) {
    baseFilter.year = String(req.query.year).trim().toUpperCase();
  }

  const { data, pagination } = await versionedCrud.getMultiAllHistory(
    Income,
    req.employee._id,
    req.query,
    {
      baseFilter,
      defaultSearchFields: ["title", "source", "year", "amount", "notes", "actionType"],
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        data,
        "Full income audit history retrieved successfully.",
        pagination
      )
    );
});

export default {
  getIncomes,
  addIncome,
  updateIncome,
  deleteIncome,
  getIncomeItemHistory,
  getAllIncomesHistory,
};
