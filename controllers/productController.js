import productModel from "../models/productModel.js";
import slugify from "slugify";
import fs from "fs";


// CREATE PRODUCT
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.fields;
    const { photo } = req.files || {};

    // validation
    if (!name || !description || !price || !quantity || !category) {
      return res.status(400).send({
        success: false,
        message: "All fields are required",
      });
    }

    const product = new productModel({
      name,
      description,
      price,
      quantity,
      category,
      slug: slugify(name),
    });

    if (photo) {
      if (photo.size > 1000000) {
        return res.status(400).send({
          success: false,
          message: "Photo must be less than 1MB",
        });
      }

      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();

    res.status(201).send({
      success: true,
      message: "Product created successfully",
      productId: product._id,   // 👈 IMPORTANT
      product,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).send({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};



//Get All Products (Public)
export const getAllProductsController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .select("-photo")   // ✅ REQUIRED
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      total: products.length,
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};



//Get Single Products 
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findById(req.params.id)
      .select("-photo");   // ✅ REQUIRED

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).send({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error getting product",
      error: error.message,
    });
  }
};



//Get All Products (Admin)
export const getAdminProductsController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .select("-photo")   // ✅ REQUIRED
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};


// Update Product
export const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = { ...req.fields };

    // ✅ Only create slug if name exists
    if (req.fields?.name && typeof req.fields.name === "string") {
      updateData.slug = slugify(req.fields.name, { lower: true });
    }

    const product = await productModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Product updated",
      product,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    res.status(500).send({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};


//Delete Product
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.id);

    res.status(200).send({
      success: true,
      message: "Product deleted",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting product",
      error,
    });
  }
};
