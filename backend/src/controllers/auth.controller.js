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

export const registerEmployee = asyncHandler(async (req, res) => {
  // Extract data from request body (support nested credentials or flat payload)
  const email = (req.body.credentials?.email || req.body.email || "").trim();
  const password = req.body.credentials?.password || req.body.password || "";

  // Validate required fields
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  // Check if employee already exists
  const existingEmployee = await Employee.findOne({
    "credentials.email": email.toLowerCase(),
  });

  if (existingEmployee) {
    throw new ApiError(409, "Email is already registered.");
  }

  // Create new employee
  const employee = await Employee.create({
    credentials: {
      email: email.toLowerCase(),
      password,
    },
  });

  // Generate tokens & set cookies
  const { accessToken } = await generateTokensAndSetCookies(employee, res);

  // Send success response
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

export const loginEmployee = asyncHandler(async (req, res) => {
  // Extract request body (support nested credentials or flat payload)
  const email = (req.body.credentials?.email || req.body.email || "").trim();
  const password = req.body.credentials?.password || req.body.password || "";

  // Validate input
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  // Find employee and include hidden fields
  const employee = await Employee.findOne({
    "credentials.email": email.toLowerCase(),
  }).select("+credentials.password +refreshToken");

  // Employee not found
  if (!employee) {
    throw new ApiError(401, "Invalid email or password.");
  }

  // Verify password
  const isPasswordCorrect = await employee.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password.");
  }

  // Generate new access & refresh tokens
  const { accessToken } = await generateTokensAndSetCookies(employee, res);

  // Send response
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
