import jwt from "jsonwebtoken";

import Employee from "../models/employee/employee.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  // Get token from cookies or Authorization header
  const token =
    req.cookies?.accessToken ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  // Check if token exists
  if (!token) {
    throw new ApiError(401, "Access denied. Please login again.");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token has expired.");
    }
    throw new ApiError(401, "Invalid access token.");
  }

  // Find the authenticated employee
  const employee = await Employee.findById(decoded.employeeId);

  if (!employee) {
    throw new ApiError(401, "Employee no longer exists.");
  }

  // Attach employee to request object
  req.employee = employee;

  next();
});
