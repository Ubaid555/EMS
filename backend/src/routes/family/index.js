import express from "express";
import spouseRoutes from "./spouse.routes.js";
import childRoutes from "./child.routes.js";
import parentRoutes from "./parent.routes.js";
import { Spouse, Child, Parent } from "../../models/family/index.js";
import { protect } from "../../middleware/auth.middleware.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

const router = express.Router();

router.use(protect);

// -------------------------------------------------------------------------
// Consolidated Family Summary Overview
// -------------------------------------------------------------------------
router.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const filter = {
      employeeId: req.employee._id,
      isCurrent: true,
      isDeleted: false,
    };

    const [spouses, children, parents] = await Promise.all([
      Spouse.find(filter).lean(),
      Child.find(filter).lean(),
      Parent.find(filter).lean(),
    ]);

    const totalDependents =
      spouses.filter((s) => s.isDependent).length +
      children.filter((c) => c.isDependent).length +
      parents.filter((p) => p.isDependent).length;

    const summary = {
      counts: {
        totalMembers: spouses.length + children.length + parents.length,
        spouses: spouses.length,
        children: children.length,
        parents: parents.length,
        totalDependents,
      },
      spouses,
      children,
      parents,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, summary, "Family summary retrieved successfully."));
  })
);

// -------------------------------------------------------------------------
// Pillar Sub-Routers
// -------------------------------------------------------------------------
router.use("/spouses", spouseRoutes);
router.use("/children", childRoutes);
router.use("/parents", parentRoutes);

export default router;
