import "dotenv/config";

/**
 * =========================================
 * Centralized Environment Configuration
 * =========================================
 * Single source of truth for all environment variables.
 * Usage: import env from "./config/env.config.js";
 */
export const env = {
  // Server & Environment
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  // Database
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ems",

  // JWT Credentials
  ACCESS_TOKEN_SECRET:
    process.env.ACCESS_TOKEN_SECRET ||
    "ems_super_secret_jwt_access_token_key_2026_secure",
  ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES || "15m",

  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET ||
    "ems_super_secret_jwt_refresh_token_key_2026_secure",
  REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES || "7d",

  // Helpers
  isProduction: (process.env.NODE_ENV || "development") === "production",
  isDevelopment: (process.env.NODE_ENV || "development") === "development",
};

export default env;
