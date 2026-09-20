import express from "express";
import {
  getCurrentEmployee,
  loginEmployee,
  logoutEmployee,
  refreshAccessToken,
  registerEmployee,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerEmployee);
router.post("/login", loginEmployee);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", protect, logoutEmployee);
router.get("/me", protect, getCurrentEmployee);

export default router;
