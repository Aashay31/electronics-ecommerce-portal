const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const sendEmail = require("../utils/sendEmail");
const statusTemplate = require("../templates/statusTemplate");
const { assessCancellationEligibility } = require("./orderSupportService");

async function cancelOrderForUser({ orderId, userId, reason = "Cancelled via support assistant" }) {
  const order = await Order.findById(orderId);

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  if (String(order.user) !== String(userId)) {
    const error = new Error("Not authorized");
    error.statusCode = 403;
    throw error;
  }

  const assessment = assessCancellationEligibility(order);
  if (!assessment.eligible) {
    const error = new Error(assessment.shortMessage);
    error.statusCode = 400;
    error.assessment = assessment;
    error.order = order;
    throw error;
  }

  order.orderStatus = "Cancelled";
  order.cancellationReason = reason || order.cancellationReason || "Ordered by mistake";
  order.cancelledBy = "user";
  order.cancelledAt = new Date();
  await order.save();

  try {
    const user = await User.findById(order.user);
    const statusUrl = `${process.env.FRONTEND_URL}/profile`;
    await sendEmail({
      email: user.email,
      subject: "Order Cancelled - ElectroMart",
      html: statusTemplate(order, user.fullName, statusUrl),
    });
  } catch (error) {
    console.error("Order cancellation email could not be sent:", error);
  }

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  return order;
}

module.exports = {
  cancelOrderForUser,
};
