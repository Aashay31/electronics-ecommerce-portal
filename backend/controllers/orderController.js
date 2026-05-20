const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const sendEmail = require("../utils/sendEmail");
const orderTemplate = require("../templates/orderTemplate");
const statusTemplate = require("../templates/statusTemplate");

const normalizeAmount = (value) => {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    return 0;
  }
  return Math.max(0, Math.round(numberValue * 100) / 100);
};
// Place a new order
const placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount, shippingCharge, taxAmount } = req.body;
    const userId = req.user.id;

    if (paymentMethod !== "Cash on Delivery") {
      return res.status(400).json({
        success: false,
        message: "Please use Razorpay checkout for online payments",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No order items" });
    }

    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: "Shipping address is required" });
    }

    // Validate stock and calculate total (to prevent frontend tampering)
    let calculatedSubtotal = 0;
    const orderItems = [];

    for (let item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found` });
      }

      if (product.stock <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: "Product is out of stock" 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: "Requested quantity exceeds available stock" 
        });
      }

      calculatedSubtotal += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Optional: Add shipping charge or tax if needed, currently matching exactly
    // For now we trust the calculated total from DB over frontend total to prevent tampering.
    // If frontend added shipping, we might need a small tolerance or shipping logic.
    // Let's assume totalAmount passed from frontend includes tax/shipping, but we'll use our calculated base + flat shipping here if we wanted.
    // To match user prompt, we'll trust the verified products base + any valid shipping. We'll just use the items base for now.

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

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount: calculatedTotal,
      shippingAddress,
      paymentMethod,
      paymentStatus: "Pending",
      transactionStatus: "created",
    });

    // Populate order items product for email
    const populatedOrder = await Order.findById(order._id).populate("items.product");
    const user = await User.findById(userId);

    // Send order confirmation email
    try {
      const orderUrl = `${process.env.FRONTEND_URL}/profile`;
      await sendEmail({
        email: user.email,
        subject: "Order Confirmation - ElectroMart",
        html: orderTemplate(populatedOrder, user.fullName, orderUrl),
      });
    } catch (err) {
      console.error("Order confirmation email could not be sent:", err);
    }

    // Reduce stock
    for (let item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear user cart
    await User.findByIdAndUpdate(userId, { cartItems: [] });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get User's Orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
      $or: [
        { paymentMethod: "Cash on Delivery" },
        { paymentStatus: "Paid", razorpayPaymentId: { $ne: null } },
      ],
    })
      .populate("items.product", "productName imageUrl price category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Order Details
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "productName imageUrl price category");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Check if the order belongs to the user OR user is admin
    const user = await User.findById(req.user.id);
    if (order.user.toString() !== req.user.id && user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel Order
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({ 
        success: false, 
        message: "Order is already cancelled" 
      });
    }

    if (["Shipped", "Delivered"].includes(order.orderStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot cancel order that is already shipped or delivered" 
      });
    }

    if (order.paymentMethod !== "Cash on Delivery" || order.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Paid orders cannot be cancelled",
      });
    }

    const { reason } = req.body;

    order.orderStatus = "Cancelled";
    order.cancellationReason = reason || order.cancellationReason || "Ordered by mistake";
    order.cancelledBy = "user";
    order.cancelledAt = new Date();
    await order.save();

    // Send cancellation email
    try {
      const user = await User.findById(order.user);
      const statusUrl = `${process.env.FRONTEND_URL}/profile`;
      await sendEmail({
        email: user.email,
        subject: "Order Cancelled - ElectroMart",
        html: statusTemplate(order, user.fullName, statusUrl),
      });
    } catch (err) {
      console.error("Order cancellation email could not be sent:", err);
    }

    // Restore stock
    for (let item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
  getOrderById,
  cancelOrder
};
