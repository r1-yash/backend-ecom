//Create Category (Admin)
import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";

export const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).send({ message: "Category name required" });
    }

    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(409).send({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await new categoryModel({
      name,
      slug: slugify(name),
    }).save();

    res.status(201).send({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error creating category",
      error,
    });
  }
};




//Update Category (Admin)
export const updateCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Category updated",
      category,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating category",
      error,
    });
  }
};




//Delete Category (Admin)
export const deleteCategoryController = async (req, res) => {
  try {
    await categoryModel.findByIdAndDelete(req.params.id);

    res.status(200).send({
      success: true,
      message: "Category deleted",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting category",
      error,
    });
  }
};




//Get All Categories (Public)
export const getAllCategoryController = async (req, res) => {
  try {
    const categories = await categoryModel.find({}).sort({ name: 1 });

    res.status(200).send({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching categories",
      error,
    });
  }
};



//Get Single Category (Slug)
export const getSingleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({
      slug: req.params.slug,
    });

    res.status(200).send({
      success: true,
      category,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching category",
      error,
    });
  }
};
