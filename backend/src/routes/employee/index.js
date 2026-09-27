import express from "express";
import basicInfoRoutes from "./basicInfo.routes.js";
import cnicRoutes from "./cnic.routes.js";
import languageRoutes from "./language.routes.js";
import contactRoutes from "./contact.routes.js";
import addressRoutes from "./address.routes.js";

const router = express.Router();

router.use("/basic-info", basicInfoRoutes);
router.use("/cnic", cnicRoutes);
router.use("/languages", languageRoutes);
router.use("/contacts", contactRoutes);
router.use("/addresses", addressRoutes);

export default router;
