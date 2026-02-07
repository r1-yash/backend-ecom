import express from "express";
import {
  placeOrderController,
  getUserOrdersController,
  getAllOrdersController,
  updateOrderStatusController,
  cancelOrderController,
  cancelOrderItemController,
  requestReturnController,
  requestReturnItemController,
  handleReturnController,
  handleReturnItemController
} from "../controllers/orderController.js";
import { getOrderTimelineController } from "../controllers/orderTimelineController.js";
import { adminDashboardStatsController } from "../controllers/adminOrderController.js";

import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User routes
router.post("/place", requireSignIn, placeOrderController);
router.get("/user-orders", requireSignIn, getUserOrdersController);

// Admin routes
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);
router.put(
  "/update-status/:orderId",
  requireSignIn,
  isAdmin,
  updateOrderStatusController
);

// Cancel all items of a particular Order using orderId
router.put("/cancel/:orderId", requireSignIn, cancelOrderController);

//cancel one particular item of a order by orderId & itemId
router.put(
  "/cancel-item/:orderId/:itemId",
  requireSignIn,
  cancelOrderItemController
);

// User: Request Return for all items of a particular order
router.put("/return/:orderId", requireSignIn, requestReturnController);

// User: Request return for a particular item od a particular order
router.put(
  "/return-item/:orderId/:itemId",
  requireSignIn,
  requestReturnItemController
);

// Admin: Handle Return of all items of a order
router.put(
  "/return-action/:orderId",
  requireSignIn,
  isAdmin,
  handleReturnController
);

// Admin: Handle a particular Item Return of a order
router.put(
  "/return-item-action/:orderId/:itemId",
  requireSignIn,
  isAdmin,
  handleReturnItemController
);

// Get Order Timeline
router.get(
  "/timeline/:orderId",
  requireSignIn,
  getOrderTimelineController
);

// Admin Dashboard Stats
router.get(
  "/admin-stats",
  requireSignIn,
  isAdmin,
  adminDashboardStatsController
);

export default router;
