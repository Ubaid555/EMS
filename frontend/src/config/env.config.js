/**
 * Centralized Application Environment Configuration
 * Reads VITE_ prefixed environment variables defined in .env
 */

export const ENV = {
  // Base URL for all backend API endpoints
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api/v1',

  // Current environment mode
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  MODE: import.meta.env.MODE,
};

export default ENV;
