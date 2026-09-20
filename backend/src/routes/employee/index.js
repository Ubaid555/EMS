import express from "express";
import basicInfoRoutes from "./basicInfo.routes.js";
import cnicRoutes from "./cnic.routes.js";
import languageRoutes from "./language.routes.js";

const router = express.Router();

router.use("/basic-info", basicInfoRoutes);
router.use("/cnic", cnicRoutes);
router.use("/languages", languageRoutes);

export default router;
