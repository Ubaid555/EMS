import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;

  // If the error is not already an instance of ApiError, transform or wrap it
  if (!(error instanceof ApiError)) {
    let statusCode =
      error.statusCode || (error.status ? error.status : 500);
    let message = error.message || "Internal Server Error";
    let errors = [];

    // Mongoose bad ObjectId (CastError)
    if (err.name === "CastError") {
      statusCode = 400;
      message = `Invalid resource identifier: ${err.path}`;
    }
    // Mongoose duplicate key error (code 11000)
    else if (err.code === 11000) {
      statusCode = 409;
      const field = Object.keys(err.keyValue || {})[0] || "field";
      message = `Duplicate value entered for '${field}'. Please use another value.`;
    }
    // Mongoose validation error
    else if (err.name === "ValidationError") {
      statusCode = 400;
      errors = Object.values(err.errors || {}).map((val) => val.message);
      message = errors.join(", ") || "Validation Error";
    }
    // Body-parser / express.json malformed JSON
    else if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      statusCode = 400;
      message = "Malformed JSON payload in request body.";
    }
    // CORS error
    else if (err.message && err.message.startsWith("CORS error")) {
      statusCode = 403;
      message = err.message;
    }

    error = new ApiError(statusCode, message, errors, err.stack);
  }

  const statusCode = error.statusCode || 500;

  const response = {
    success: false,
    statusCode,
    message: error.message || "Internal Server Error",
    errors: error.errors || [],
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  return res.status(statusCode).json(response);
};

export default errorHandler;

