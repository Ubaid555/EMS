import env from "./config/env.config.js";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import ApiResponse from "./utils/ApiResponse.js";
import ApiError from "./utils/ApiError.js";

import authRoutes from "./routes/auth.routes.js";
import lookupRoutes from "./routes/lookup.routes.js";
import employeeRoutes from "./routes/employee/index.js";
import financeRoutes from "./routes/finance/index.js";
import familyRoutes from "./routes/family/index.js";
import { serveSwagger, setupSwagger } from "./config/swagger.js";

const app = express();

// Security HTTP headers (CSP disabled so Swagger UI can execute scripts/styles)
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

const allowedOrigins = [
  env.CLIENT_URL,
  "http://localhost:3000",
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

// Swagger Interactive API Documentation
app.use("/api-docs", serveSwagger, setupSwagger);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/lookups", lookupRoutes);
app.use("/api/v1/employee", employeeRoutes);
app.use("/api/v1/finance", financeRoutes);
app.use("/api/v1/family", familyRoutes);

app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, null, "API is running successfully 🚀"));
});

app.get("/api/v1/health", (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, null, "API is running successfully 🚀"));
});

app.use(notFound);


app.use(errorHandler);

export default app;
