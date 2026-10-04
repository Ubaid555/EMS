/**
 * Centralized API Error Utility
 * Parses responses from the Express backend and produces structured, user-friendly messages.
 * Matches backend ApiError structure: { statusCode, success: false, message, errors: [] }
 */

export class AppApiError extends Error {
  constructor(message, status = 500, errors = [], fieldErrors = {}) {
    super(message);
    this.name = 'AppApiError';
    this.status = status;
    this.errors = errors;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Parse any Axios or JavaScript error into a standardized error object
 * @param {any} error
 * @returns {{ message: string, status: number, errors: string[], fieldErrors: Record<string, string> }}
 */
export function parseApiError(error) {
  // If already parsed
  if (error instanceof AppApiError) {
    return {
      message: error.message,
      status: error.status,
      errors: error.errors,
      fieldErrors: error.fieldErrors,
    };
  }

  // Network / Offline Error
  if (!error.response) {
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      return {
        message: 'Unable to reach the server. Please check your network connection.',
        status: 0,
        errors: ['Network connection failed.'],
        fieldErrors: {},
      };
    }
    return {
      message: error.message || 'An unexpected client error occurred.',
      status: 0,
      errors: [error.message || 'Client error'],
      fieldErrors: {},
    };
  }

  const { status, data } = error.response;
  const message = data?.message || data?.error || 'A server error occurred. Please try again.';
  const errors = Array.isArray(data?.errors) ? data.errors : [];

  // Extract field-level errors if backend provided them (e.g. [{ field: 'email', message: '...' }])
  const fieldErrors = {};
  if (Array.isArray(data?.errors)) {
    data.errors.forEach((err) => {
      if (typeof err === 'object' && err !== null && (err.field || err.path)) {
        const key = err.field || err.path;
        fieldErrors[key] = err.message || err.msg || 'Invalid field';
      }
    });
  }

  return {
    message,
    status,
    errors: errors.map((e) => (typeof e === 'string' ? e : e.message || JSON.stringify(e))),
    fieldErrors,
  };
}
