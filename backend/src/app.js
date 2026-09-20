import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import ApiResponse from "./utils/ApiResponse.js";
import ApiError from "./utils/ApiError.js";

import authRoutes from "./routes/auth.routes.js";

const app = express();

// Security HTTP headers
app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new ApiError(403, `CORS error: Origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// Parse JSON request body
app.use(express.json());

// Parse URL encoded data
app.use(express.urlencoded({ extended: true }));

// Parse Cookies
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, null, "API is running successfully 🚀"));
});

app.use(notFound);


app.use(errorHandler);

export default app;
