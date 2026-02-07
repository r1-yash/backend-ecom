import express from "express";
import { adminDashboardStatsController } from "../controllers/adminOrderController.js";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin Dashboard Stats
router.get("/dashboard-stats", requireSignIn, isAdmin, adminDashboardStatsController);

export default router;
