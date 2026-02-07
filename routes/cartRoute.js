import express from "express";
import {
  addToCartController,
  getCartController,
  updateCartController,
  removeFromCartController,
  clearCartController,
} from "../controllers/cartController.js";

import { requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Add to Cart
router.post("/add", requireSignIn, addToCartController);

// Get Cart
router.get("/get", requireSignIn, getCartController);

// Update Cart Item
router.put("/update", requireSignIn, updateCartController);

// Remove Item
router.delete("/remove/:productId", requireSignIn, removeFromCartController);

// Clear Cart
router.delete("/clear", requireSignIn, clearCartController);

export default router;
