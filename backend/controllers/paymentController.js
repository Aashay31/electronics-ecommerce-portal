const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const PaymentAttempt = require("../models/PaymentAttempt");
const Product = require("../models/Product");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const orderTemplate = require("../templates/orderTemplate");
const { getIO } = require("../socket");
const { emitDashboardStats } = require("../utils/emitDashboardStats");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const buildOrderItems = async (items = []) => {
  if (!items.length) {
    return { orderItems: [], calculatedSubtotal: 0 };
  }

  let calculatedSubtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stock <= 0) {
      throw new Error("Product is out of stock");
    }

    if (product.stock < item.quantity) {
      throw new Error("Requested quantity exceeds available stock");
    }

    calculatedSubtotal += product.price * item.quantity;
    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price,
    });
  }

  return { orderItems, calculatedSubtotal };
};

const normalizeAmount = (value) => {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    return 0;
  }
  return Math.max(0, Math.round(numberValue * 100) / 100);
};

const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount, shippingCharge, taxAmount } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No order items" });
    }

    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: "Shipping address is required" });
    }

    if (!paymentMethod || paymentMethod === "Cash on Delivery") {
      return res.status(400).json({
        success: false,
        message: "Select an online payment method to continue",
      });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay credentials are not configured",
      });
    }

    const { orderItems, calculatedSubtotal } = await buildOrderItems(items);
    const safeShipping = normalizeAmount(shippingCharge);
    const safeTax = normalizeAmount(taxAmount);
    const calculatedTotal = normalizeAmount(calculatedSubtotal + safeShipping + safeTax);
    const requestedTotal = normalizeAmount(totalAmount);

    if (!requestedTotal || Math.abs(calculatedTotal - requestedTotal) > 1) {
      return res.status(400).json({
        success: false,
        message: "Total amount mismatch. Please refresh and try again.",
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(calculatedTotal * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    await PaymentAttempt.create({
      user: userId,
      items: orderItems,
      totalAmount: calculatedTotal,
      shippingAddress,
      paymentMethod,
      shippingCharge: safeShipping,
      taxAmount: safeTax,
      razorpayOrderId: razorpayOrder.id,
      status: "created",
    });

    return res.status(201).json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error in paymentController.js:", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay payment verification fields",
      });
    }

    const bodyStr = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(bodyStr.toString())
      .digest("hex");

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ 
        success: false,
        message: "Payment verification failed. Invalid signature." 
      });
    }

    const existingOrder = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (existingOrder) {
      if (existingOrder.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: "Not authorized" });
      }
      return res.status(200).json({ success: true, order: existingOrder });
    }

    const attempt = await PaymentAttempt.findOne({ razorpayOrderId: razorpay_order_id });
    if (!attempt) {
      return res.status(404).json({ success: false, message: "Payment attempt not found" });
    }

    if (attempt.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const order = await Order.create({
      user: attempt.user,
      items: attempt.items,
      totalAmount: attempt.totalAmount,
      shippingAddress: attempt.shippingAddress,
      paymentMethod: attempt.paymentMethod,
      paymentStatus: "Paid",
      transactionStatus: "captured",
      razorpayOrderId: attempt.razorpayOrderId,
      razorpayPaymentId: razorpay_payment_id,
    });

    attempt.status = "completed";
    attempt.razorpayPaymentId = razorpay_payment_id;
    await attempt.save();

    // Reduce stock only after payment confirmation
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, soldCount: item.quantity },
      });
    }

    await User.findByIdAndUpdate(order.user, { cartItems: [] });

    try {
      const populatedOrder = await Order.findById(order._id).populate("items.product");
      const user = await User.findById(order.user);
      const orderUrl = `${process.env.FRONTEND_URL}/orders/${order._id}`;
      await sendEmail({
        email: user.email,
        subject: "Order Confirmation - ElectroMart",
        html: orderTemplate(populatedOrder, user.fullName, orderUrl),
      });
    } catch (err) {
      console.error("Order confirmation email could not be sent:", err);
    }

    // Socket: emit order:created to user room and admin room
    try {
      const io = getIO();
      const populatedForSocket = await Order.findById(order._id).populate("items.product", "productName imageUrl price category");
      io.to(`user:${String(order.user)}`).emit("order:created", populatedForSocket);

      // Populate user details for admin room
      const adminOrderRaw = await Order.findById(order._id)
        .populate("user", "fullName email")
        .populate("items.product", "productName imageUrl price category");

      if (adminOrderRaw) {
        const adminOrder = adminOrderRaw.toObject();
        adminOrder.customerName = adminOrderRaw.user?.fullName;
        adminOrder.customerEmail = adminOrderRaw.user?.email;
        adminOrder.userId = adminOrderRaw.user?._id;
        adminOrder.total = adminOrderRaw.totalAmount;
        adminOrder.orderedAt = adminOrderRaw.createdAt;
        adminOrder.deliveryStatus = adminOrderRaw.orderStatus;
        adminOrder.paymentMethod = adminOrderRaw.paymentMethod;
        adminOrder.paymentStatus = adminOrderRaw.paymentStatus;
        adminOrder.transactionId = adminOrderRaw.razorpayPaymentId || adminOrderRaw.razorpayOrderId || null;
        adminOrder.cancellationReason = adminOrderRaw.cancellationReason || null;

        io.to("admin").emit("order:created", adminOrder);
      }

      // Emit stock updates for each product
      for (const item of order.items) {
        const updatedProduct = await Product.findById(item.product).select("_id stock price");
        if (updatedProduct) {
          io.emit("product:stockUpdated", {
            productId: updatedProduct._id,
            stock: updatedProduct.stock,
          });
        }
      }

      emitDashboardStats();
    } catch (socketError) {
      console.error("[Socket] Error emitting order:created:", socketError.message);
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error in paymentController.js:", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

const webhookHandler = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(500).json({ success: false, message: "Webhook secret not configured" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const payload = JSON.parse(req.body.toString());
    const event = payload.event;
    const paymentEntity = payload?.payload?.payment?.entity;
    const refundEntity = payload?.payload?.refund?.entity;

    let order = null;
    if (paymentEntity?.order_id) {
      order = await Order.findOne({ razorpayOrderId: paymentEntity.order_id });
    } else if (refundEntity?.payment_id) {
      order = await Order.findOne({ razorpayPaymentId: refundEntity.payment_id });
    }

    if (!order) {
      return res.status(200).json({ success: true, message: "Order not found for webhook" });
    }

    if (event === "payment.captured") {
      order.paymentStatus = "Paid";
      order.transactionStatus = "captured";
      order.razorpayPaymentId = paymentEntity?.id || order.razorpayPaymentId;
      if (order.orderStatus === "Pending") {
        order.orderStatus = "Confirmed";
      }
      try {
        const io = getIO();
        io.to(`user:${String(order.user)}`).emit("order:statusUpdated", {
          orderId: order._id,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus
        });
      } catch (err) {}
    }

    if (event === "payment.failed") {
      order.paymentStatus = "Failed";
      order.transactionStatus = "failed";
      try {
        const io = getIO();
        io.to(`user:${String(order.user)}`).emit("order:paymentFailed", {
          orderId: order._id,
        });
      } catch (err) {}
    }

    if (event === "refund.processed") {
      order.paymentStatus = "Refunded";
      order.transactionStatus = "refunded";
    }

    await order.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in webhookHandler:", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  webhookHandler,
};
