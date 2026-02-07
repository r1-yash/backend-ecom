//Utility: Calculate Cart Total
const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};


//Add to Cart
import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js";

// ADD TO CART
export const addToCartController = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await cartModel.findOne({ user: userId });

    // If cart does not exist
    if (!cart) {
      cart = new cartModel({
        user: userId,
        items: [
          {
            product: product._id,
            quantity,
            price: product.price,
          },
        ],
      });
    } else {
      // If product already in cart
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          product: product._id,
          quantity,
          price: product.price,
        });
      }
    }

    cart.totalPrice = calculateTotal(cart.items);
    await cart.save();

    res.status(200).send({
      success: true,
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error adding to cart",
      error,
    });
  }
};




//Get User Cart
export const getCartController = async (req, res) => {
  try {
    const cart = await cartModel
      .findOne({ user: req.user._id })
      .populate("items.product");

    if (!cart) {
      return res.status(200).send({
        success: true,
        cart: { items: [], totalPrice: 0 },
      });
    }

    res.status(200).send({
      success: true,
      cart,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching cart",
      error,
    });
  }
};



//Update Cart Item Quantity
export const updateCartController = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const cart = await cartModel.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).send({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).send({
        success: false,
        message: "Item not found in cart",
      });
    }

    item.quantity = quantity;
    cart.totalPrice = calculateTotal(cart.items);
    await cart.save();

    res.status(200).send({
      success: true,
      message: "Cart updated",
      cart,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating cart",
      error,
    });
  }
};




//Remove Item from Cart
export const removeFromCartController = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await cartModel.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).send({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    cart.totalPrice = calculateTotal(cart.items);
    await cart.save();

    res.status(200).send({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error removing item",
      error,
    });
  }
};




//Clear Cart
export const clearCartController = async (req, res) => {
  try {
    await cartModel.findOneAndDelete({ user: req.user._id });

    res.status(200).send({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error clearing cart",
      error,
    });
  }
};
