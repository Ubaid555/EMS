import jwt from "jsonwebtoken";

import Employee from "../models/employee/employee.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  generateTokensAndSetCookies,
  sanitizeEmployee,
} from "../helpers/auth.helper.js";
import { cookieOptions } from "../config/cookie.config.js";
import env from "../config/env.config.js";

/**
 * Register New Employee Account
 * POST /api/v1/auth/register
 */
export const registerEmployee = asyncHandler(async (req, res) => {
  // Extract inputs (support both flat and nested credentials payload)
  const roleRaw = req.body.credentials?.role || req.body.role;
  const subCategoryRaw =
    req.body.credentials?.subCategory || req.body.subCategory;
  const assignedNumberRaw =
    req.body.credentials?.assignedNumber || req.body.assignedNumber;
  const emailRaw = req.body.credentials?.email || req.body.email;
  const password = req.body.credentials?.password || req.body.password;

  if (!roleRaw) {
    throw new ApiError(400, "Role is required (ADMIN, TEACHER, or STAFF).");
  }

  let role = String(roleRaw).trim().toUpperCase();
  if (role === "OTHER_STAFF") role = "STAFF";

  if (!["ADMIN", "TEACHER", "STAFF"].includes(role)) {
    throw new ApiError(400, "Invalid role. Must be ADMIN, TEACHER, or STAFF.");
  }

  let subCategory = null;
  if (role === "TEACHER") {
    if (!subCategoryRaw) {
      throw new ApiError(
        400,
        "Sub-category is required for Teacher (MONTESSORI, PRIMARY, MIDDLE, HIGH, COLLEGE)."
      );
    }
    subCategory = String(subCategoryRaw).trim().toUpperCase();
    if (subCategory === "MONTESSORY") subCategory = "MONTESSORI";

    const allowedSubCategories = [
      "MONTESSORI",
      "PRIMARY",
      "MIDDLE",
      "HIGH",
      "COLLEGE",
    ];
    if (!allowedSubCategories.includes(subCategory)) {
      throw new ApiError(
        400,
        `Invalid sub-category for Teacher. Allowed values: ${allowedSubCategories.join(", ")}`
      );
    }
  }

  if (!assignedNumberRaw || String(assignedNumberRaw).trim() === "") {
    throw new ApiError(400, "Assigned number is required.");
  }
  const assignedNumber = String(assignedNumberRaw).trim();

  if (!password || String(password).length < 8) {
    throw new ApiError(
      400,
      "Password is required and must be at least 8 characters long."
    );
  }

  const email = emailRaw ? String(emailRaw).trim().toLowerCase() : "";

  // Check if an employee with the exact role + subCategory + assignedNumber already exists
  const existingEmployee = await Employee.findOne({
    "credentials.role": role,
    "credentials.subCategory": subCategory,
    "credentials.assignedNumber": assignedNumber,
  });

  if (existingEmployee) {
    const roleDesc = role === "TEACHER" ? `Teacher (${subCategory})` : role;
    throw new ApiError(
      409,
      `An employee with ${roleDesc} and assigned number '${assignedNumber}' is already registered.`
    );
  }

  // Create new employee
  const employee = await Employee.create({
    credentials: {
      role,
      subCategory,
      assignedNumber,
      email,
      password,
    },
  });

  // Generate tokens & set cookies
  const { accessToken } = await generateTokensAndSetCookies(employee, res);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        {
          ...sanitizeEmployee(employee),
          accessToken,
        },
        "Employee registered successfully."
      )
    );
});

/**
 * Login Employee Account
 * POST /api/v1/auth/login
 */
export const loginEmployee = asyncHandler(async (req, res) => {
  // Extract inputs (support both flat and nested credentials payload)
  const roleRaw = req.body.credentials?.role || req.body.role;
  const subCategoryRaw =
    req.body.credentials?.subCategory || req.body.subCategory;
  const assignedNumberRaw =
    req.body.credentials?.assignedNumber || req.body.assignedNumber;
  const password = req.body.credentials?.password || req.body.password;

  if (!roleRaw) {
    throw new ApiError(
      400,
      "Role selector is required (ADMIN, TEACHER, or STAFF)."
    );
  }

  let role = String(roleRaw).trim().toUpperCase();
  if (role === "OTHER_STAFF") role = "STAFF";

  if (!["ADMIN", "TEACHER", "STAFF"].includes(role)) {
    throw new ApiError(400, "Invalid role. Must be ADMIN, TEACHER, or STAFF.");
  }

  let subCategory = null;
  if (role === "TEACHER") {
    if (!subCategoryRaw) {
      throw new ApiError(
        400,
        "Sub-category is required for Teacher login (MONTESSORI, PRIMARY, MIDDLE, HIGH, COLLEGE)."
      );
    }
    subCategory = String(subCategoryRaw).trim().toUpperCase();
    if (subCategory === "MONTESSORY") subCategory = "MONTESSORI";
  }

  if (!assignedNumberRaw || String(assignedNumberRaw).trim() === "") {
    throw new ApiError(400, "Assigned number is required.");
  }
  const assignedNumber = String(assignedNumberRaw).trim();

  if (!password) {
    throw new ApiError(400, "Password is required.");
  }

  // Build query: match role, subCategory, and assignedNumber
  const query = {
    "credentials.role": role,
    "credentials.subCategory": subCategory,
    "credentials.assignedNumber": assignedNumber,
  };

  // Find employee and include hidden password & refreshToken
  const employee = await Employee.findOne(query).select(
    "+credentials.password +refreshToken"
  );

  if (!employee) {
    throw new ApiError(401, "Invalid credentials or assigned number.");
  }

  // Verify password
  const isPasswordCorrect = await employee.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials or assigned number.");
  }

  // Generate new access & refresh tokens
  const { accessToken } = await generateTokensAndSetCookies(employee, res);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          ...sanitizeEmployee(employee),
          accessToken,
        },
        "Login successful."
      )
    );
});

export const getCurrentEmployee = asyncHandler(async (req, res) => {
  const currentEmployee = req.employee;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        sanitizeEmployee(currentEmployee),
        "Current Employee fetched successfully."
      )
    );
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh Token is missing.");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      env.REFRESH_TOKEN_SECRET
    );
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh Token.");
  }

  const employeeId = decodedToken.employeeId;
  const employee = await Employee.findById(employeeId).select("+refreshToken");

  if (!employee) {
    throw new ApiError(401, "Employee no longer exists.");
  }

  if (employee.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token has been reused or is invalid.");
  }

  await generateTokensAndSetCookies(employee, res);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Access Token refreshed successfully."));
});

export const logoutEmployee = asyncHandler(async (req, res) => {
  const employeeId = req.employee?._id;

  if (employeeId) {
    await Employee.findByIdAndUpdate(employeeId, {
      $unset: {
        refreshToken: 1,
      },
    });
  }

  res.clearCookie("accessToken", cookieOptions.accessToken);
  res.clearCookie("refreshToken", cookieOptions.refreshToken);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Logged out successfully."));
});
