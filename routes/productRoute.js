import express from "express";
import formidable from "express-formidable";
import {
  createProductController,
  getAllProductsController,
  getSingleProductController,
  updateProductController,
  deleteProductController,
  getAdminProductsController,
} from "../controllers/productController.js";

import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET ALL PRODUCTS
router.get("/get-products", getAllProductsController);

// GET SINGLE PRODUCT
router.get("/get-product/:id", getSingleProductController);

// CREATE PRODUCT (ADMIN)
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable({ multiples: false }),
  createProductController
);

// UPDATE PRODUCT (ADMIN)
router.put(
  "/update-product/:id",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProductController
);

// DELETE PRODUCT (ADMIN)
router.delete(
  "/delete-product/:id",
  requireSignIn,
  isAdmin,
  deleteProductController
);

//Get All Products (Admin)
router.get(
  "/admin-products", 
  requireSignIn, 
  isAdmin, 
  getAdminProductsController
);

export default router;
