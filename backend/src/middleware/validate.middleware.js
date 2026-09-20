import ApiError from "../utils/ApiError.js";

/**
 * Universal Zod Request Validation Middleware
 * Intercepts incoming req.body, parses/coerces, strips unknown fields,
 * and formats any validation errors cleanly into HTTP 400 responses.
 */
export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error.errors) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      return next(new ApiError(400, "Validation failed", formattedErrors));
    }
    return next(new ApiError(400, error.message || "Invalid request payload"));
  }
};

export default validate;
