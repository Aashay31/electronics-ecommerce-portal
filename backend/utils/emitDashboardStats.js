const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { getIO } = require("../socket");

/**
 * Query the DB for current dashboard stats and emit
 * "dashboard:statsUpdated" to the admin room.
 *
 * Call this after any order or product mutation.
 */
async function emitDashboardStats() {
  try {
    const io = getIO();

    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ role: "user" });
    const outOfStockProducts = await Product.countDocuments({ stock: { $lte: 0 } });
    const lowStockProducts = await Product.countDocuments({ stock: { $gt: 0, $lte: 5 } });

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: "Pending" });
    const revenueOrders = await Order.find({
      orderStatus: { $ne: "Cancelled" },
      $or: [
        { paymentMethod: "Cash on Delivery" },
        { paymentStatus: "Paid", razorpayPaymentId: { $ne: null } },
      ],
    });
    const failedPayments = await Order.countDocuments({ paymentStatus: "Failed" });
    const refundedPayments = await Order.countDocuments({ paymentStatus: "Refunded" });

    let totalRevenue = 0;
    revenueOrders.forEach((order) => {
      totalRevenue += order.totalAmount || 0;
    });

    const reviewAggregation = await Product.aggregate([
      { $unwind: "$reviews" },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$reviews.rating" },
        },
      },
    ]);

    const reviewStats = reviewAggregation[0] || {
      totalReviews: 0,
      averageRating: 0,
    };

    const stats = {
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue,
      failedPayments,
      refundedPayments,
      pendingOrders,
      lowStockProducts,
      outOfStockProducts,
      totalReviews: reviewStats.totalReviews,
      averageRating: Number((reviewStats.averageRating || 0).toFixed(2)),
    };

    io.to("admin").emit("dashboard:statsUpdated", stats);
  } catch (error) {
    console.error("[Socket] Failed to emit dashboard stats:", error.message);
  }
}

module.exports = { emitDashboardStats };
