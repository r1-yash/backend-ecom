import express from "express";
import { filterProductController } from "../controllers/filterController.js";

const router = express.Router();

// Filter products
router.post("/products", filterProductController);

export default router;
