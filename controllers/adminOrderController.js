import orderModel from "../models/orderModel.js";

export const adminDashboardStatsController = async (req, res) => {
  try {
    const totalOrders = await orderModel.countDocuments();
    const totalRevenue = await orderModel.aggregate([
      { $match: { orderStatus: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    res.status(200).send({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error loading dashboard stats",
      error,
    });
  }
};
