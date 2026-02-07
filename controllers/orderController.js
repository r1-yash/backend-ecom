//Place Order (From Cart)
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import cartModel from "../models/cartModel.js";
import { pushTimeline } from "../helpers/updateTimeline.js";
import { sendEmail } from "../helpers/emailService.js";
import { orderPlacedTemplate, orderCancelledTemplate, orderStatusTemplate } from "../helpers/emailTemplates.js";


// PLACE ORDER (COD)
export const placeOrderController = async (req, res) => {
  try {
    //Fetch userId & shipping address from request
    const userId = req.user._id;
    const { shippingAddress } = req.body;

    //Check shipping address is present or not
    if (!shippingAddress) {
      console.error("SHIPPING ADDRESS ERROR:", error); // 🔥 IMPORTANT
      return res.status(400).send({
        success: false,
        message: "Shipping address is required",
        error: error.message
      });
    }

    const cart = await cartModel.findOne({ user: userId });//Fetch user cart by userId

    //check the particular user-cart is present? or have any cart-items or not?
    if (!cart || cart.items.length === 0) {
      console.error("CART EMPTY ERROR:", error); // 🔥 IMPORTANT
      return res.status(400).send({
        success: false,
        message: "Cart is empty",
        error: error.message
      });
    }

    // ✅ FETCH USER object FROM DB
    const user = await userModel.findById(userId);

    if (!user) {
      console.error("USER NOT FOUND ERROR:", error); // 🔥 IMPORTANT
      return res.status(404).send({
        success: false,
        message: "User not found",
        error: error.message
      });
    }

    // ✅ GENERATE ORDER NUMBER 
    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    //create new order-object
    const order = new orderModel({
      orderNumber, // 👈 stored in DB
      user: userId,// 👈 stored in DB
      products: cart.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: cart.totalPrice,
      shippingAddress,
      timeline: [
        {
          status: "Order Placed",
          updatedBy: "User",
        },
      ],
    });

    //save new order into DB 
    await order.save();

    // After order save, send email to user
    await sendEmail({
      to: user.email,
      subject: "Order Placed Successfully",
      html: orderPlacedTemplate(order),
    });

    // Clear cart after order
    await cartModel.findOneAndDelete({ user: userId });

    res.status(201).send({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("PLACE ORDER ERROR:", error); // 🔥 IMPORTANT
    res.status(500).send({
      success: false,
      message: "Error placing order",
      error: error.message,
    });
  }
};




//Get User Orders
export const getUserOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ user: req.user._id })
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching orders",
      error,
    });
  }
};




//Admin: Get All Orders
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("user", "name email")
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching all orders",
      error,
    });
  }
};




//Admin: Update Order Status
export const updateOrderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, remark } = req.body;

    const order = await orderModel.findById(orderId);

    order.orderStatus = status;

    pushTimeline(order, status, "Admin", remark);

    await order.save();

    res.status(200).send({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating order status",
      error,
    });
  }
};




//Cancel all items of a particular-order from user cart using orderId
export const cancelOrderController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }

    // Only owner can cancel
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).send({
        success: false,
        message: "Unauthorized action",
      });
    }

    // Only processing orders
    if (order.orderStatus !== "Processing") {
      return res.status(400).send({
        success: false,
        message: "Order cannot be cancelled now",
      });
    }

    order.orderStatus = "Cancelled";
    order.cancelReason = reason;

    pushTimeline(order, "Order Cancelled", "User", reason);
    await order.save();

    //send cencel-email to user after order remove
    await sendEmail({
      to: order.user.email,
      subject: "Order Cancelled",
      html: orderCancelledTemplate(order, reason),
    });

    res.status(200).send({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error cancelling order",
      error,
    });
  }
};




//Cancel one particular-item of a particular-order from User cart using orderId & itemId
export const cancelOrderItemController = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { reason } = req.body;

    const order = await orderModel.findById(orderId);

    if (!order) {
      console.error("ORDER NOT FOUND ERROR:", error);// print error on console
      return res.status(404).send({
        success: false,
        message: "Order not found",
        error: error.message
      });
    }

    // Owner check
    if (order.user.toString() !== req.user._id.toString()) {
      console.error("UNAUTHORIZED ERROR:", error);
      return res.status(403).send({
        success: false,
        message: "Unauthorized",
        error: error.message
      });
    }

    // Find line item
    const item = order.products.id(itemId);

    if (!item) {
      console.error("ORDER ITEM NOT FOUND ERROR:", error);
      return res.status(404).send({
        success: false,
        message: "Order item not found",
        error: error.message
      });
    }

    // Remove the item
    order.products = order.products.filter(
      (p) => p._id.toString() !== itemId
    );

    // Recalculate total
    order.totalAmount = order.products.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );

    // If no items left → cancel entire order
    if (order.products.length === 0) {
      order.orderStatus = "Cancelled";
    }

    pushTimeline(order, "Item Cancelled", "User", reason);

    await order.save();//save order

    res.status(200).send({
      success: true,
      message: "Item cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("CANCEL ITEM ERROR:", error);
    res.status(500).send({
      success: false,
      message: "Error cancelling order item",
      error: error.message,
    });
  }
};





//Request Return (User) for all products items of a particular order
export const requestReturnController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }

    // Only owner
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).send({
        success: false,
        message: "Unauthorized action",
      });
    }

    // Only delivered
    if (order.orderStatus !== "Delivered") {
      return res.status(400).send({
        success: false,
        message: "Return not allowed",
      });
    }

    // Prevent duplicate return
    if (order.returnStatus !== "None") {
      return res.status(400).send({
        success: false,
        message: "Return already requested",
      });
    }

    order.returnStatus = "Requested";
    order.returnReason = reason;

    pushTimeline(order, "Return Requested", "User", reason);

    await order.save();

    res.status(200).send({
      success: true,
      message: "Return request submitted",
      order,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error requesting return",
      error,
    });
  }
};





// Request Return for a particular ITEM of an ORDER (User)
export const requestReturnItemController = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { reason } = req.body;

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }

    // Owner check
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).send({
        success: false,
        message: "Unauthorized action",
      });
    }

    // Order must be delivered
    if (order.orderStatus !== "Delivered") {
      return res.status(400).send({
        success: false,
        message: "Return allowed only after delivery",
      });
    }

    // Find item
    const item = order.products.id(itemId);

    if (!item) {
      return res.status(404).send({
        success: false,
        message: "Order item not found",
      });
    }

    // Prevent duplicate return
    if (item.returnStatus !== "None") {
      return res.status(400).send({
        success: false,
        message: "Return already requested for this item",
      });
    }

    // Mark item return
    item.returnStatus = "Requested";
    item.returnReason = reason;
    item.itemStatus = "Returned";

    pushTimeline(
      order,
      "Item Return Requested",
      "User",
      `ItemId: ${itemId}, Reason: ${reason}`
    );

    await order.save();

    res.status(200).send({
      success: true,
      message: "Item return request submitted",
      order,
    });
  } catch (error) {
    console.error("ITEM RETURN ERROR:", error);
    res.status(500).send({
      success: false,
      message: "Error requesting item return",
      error: error.message,
    });
  }
};



//Admin Approve / Reject Return
export const handleReturnController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { action } = req.body; // Approved | Rejected

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }

    order.returnStatus = action;

    if (action === "Approved") {
      order.orderStatus = "Cancelled";
    }

    pushTimeline(
      order,
      action === "Approved" ? "Return Approved" : "Return Rejected",
      "Admin"
    );

    await order.save();

    res.status(200).send({
      success: true,
      message: `Return ${action.toLowerCase()} successfully`,
      order,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error handling return",
      error,
    });
  }
};




// Admin Approve / Reject Item Return
export const handleReturnItemController = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { action } = req.body; // Approved | Rejected

    // Validate action
    if (!["Approved", "Rejected"].includes(action)) {
      return res.status(400).send({
        success: false,
        message: "Invalid action",
      });
    }

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }

    // Find item
    const item = order.products.id(itemId);

    if (!item) {
      return res.status(404).send({
        success: false,
        message: "Order item not found",
      });
    }

    // Only if return was requested earlier
    if (item.itemStatus !== "Delivered") {
      return res.status(400).send({
        success: false,
        message: "Return not allowed for this item",
      });
    }

    // Apply action
    if (action === "Approved") {
      item.itemStatus = "Returned";
      order.refundStatus = "Initiated";
    } else {
      item.itemStatus = "Delivered"; // restore
    }

    // Push timeline
    pushTimeline(
      order,
      `Item return ${action}`,
      "Admin",
      `ItemId: ${itemId}`
    );

    // If ALL items are returned → cancel order
    const allReturned = order.products.every(
      (p) => p.itemStatus === "Returned"
    );

    if (allReturned) {
      order.orderStatus = "Cancelled";
    }

    await order.save();

    res.status(200).send({
      success: true,
      message: `Item return ${action.toLowerCase()} successfully`,
      order,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error handling item return",
      error: error.message,
    });
  }
};

