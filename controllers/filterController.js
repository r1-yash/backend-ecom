import productModel from "../models/productModel.js";

// FILTER PRODUCTS
export const filterProductController = async (req, res) => {
  try {
    const { categories, priceRange } = req.body;

    let filterArgs = {};

    if (categories?.length) {
      filterArgs.category = { $in: categories };
    }

    if (priceRange?.length === 2) {
      filterArgs.price = {
        $gte: priceRange[0],
        $lte: priceRange[1],
      };
    }

    const products = await productModel
      .find(filterArgs)
      .select("-photo")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error filtering products",
      error,
    });
  }
};
