import orderModel from "../models/orderModel.js";

export const getOrderTimelineController = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orderModel.findById(orderId).select("timeline orderStatus");

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).send({
      success: true,
      orderStatus: order.orderStatus,
      timeline: order.timeline,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error fetching order timeline",
      error,
    });
  }
};
