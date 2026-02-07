import express from "express";
import {
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
  getAllCategoryController,
  getSingleCategoryController,
} from "../controllers/categoryController.js";

import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin
router.post("/create", requireSignIn, isAdmin, createCategoryController);
router.put("/update/:id", requireSignIn, isAdmin, updateCategoryController);
router.delete("/delete/:id", requireSignIn, isAdmin, deleteCategoryController);

// Public
router.get("/all", getAllCategoryController);
router.get("/:slug", getSingleCategoryController);

export default router;
