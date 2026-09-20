import { cookieOptions } from "../config/cookie.config.js";

export const generateTokensAndSetCookies = async (employee, res) => {
  // Generate Tokens
  const accessToken = employee.generateAccessToken();
  const refreshToken = employee.generateRefreshToken();

  // Save Refresh Token
  employee.refreshToken = refreshToken;

  // Don't trigger password validation again
  await employee.save({ validateBeforeSave: false });

  // Set Cookies
  res.cookie("accessToken", accessToken, cookieOptions.accessToken);
  res.cookie("refreshToken", refreshToken, cookieOptions.refreshToken);

  return {
    accessToken,
    refreshToken,
  };
};

export const sanitizeEmployee = (employee) => {
  return {
    _id: employee._id,
    credentials: {
      email: employee.credentials?.email,
    },
    createdAt: employee.createdAt,
    updatedAt: employee.updatedAt,
  };
};
