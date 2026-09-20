import express from "express";
import {
  bulkCreateLookups,
  createLookup,
  getBulkLookups,
  getCategories,
  getLookups,
  toggleLookupStatus,
  updateLookup,
} from "../controllers/lookup.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public / Form Dropdown routes (Employees can query them without restrictions)
router.get("/", getLookups);
router.get("/bulk", getBulkLookups);
router.get("/categories", getCategories);

// Management routes (Protected)
router.post("/", protect, createLookup);
router.post("/bulk", protect, bulkCreateLookups);
router.put("/:id", protect, updateLookup);
router.patch("/:id/toggle", protect, toggleLookupStatus);

export default router;
