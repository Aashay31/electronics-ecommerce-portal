const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const sendEmail = require("../utils/sendEmail");
const orderTemplate = require("../templates/orderTemplate");
const { cancelOrderForUser } = require("../services/orderCancellationService");
const { getIO } = require("../socket");
const { emitDashboardStats } = require("../utils/emitDashboardStats");
const { deleteCache, deleteCachePattern } = require("../utils/cache");

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
    console.error("Error in orderController.js:", err);
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

    // Cache invalidation: clear product detail/list caches after stock change
    for (const item of orderItems) {
      await deleteCache(`products:detail:${item.product}`);
    }
    await deleteCachePattern("products:list:*");
    await deleteCache("homepage:featured");

    // Socket: emit order:created to user room
    try {
      const io = getIO();
      io.to(`user:${userId}`).emit("order:created", populatedOrder);

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
      for (const item of orderItems) {
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
    console.error("Error in orderController.js:", socketError);
      console.error("[Socket] Error emitting order:created:", socketError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Error in orderController.js:", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again.",
    });
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
    console.error("Error in orderController.js:", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again.",
    });
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
    console.error("Error in orderController.js:", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again.",
    });
  }
};

// Cancel Order
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await cancelOrderForUser({
      orderId: req.params.id,
      userId: req.user.id,
      reason,
    });

    // Socket: emit order:cancelled to user and admin room
    try {
      const io = getIO();
      io.to(`user:${req.user.id}`).to("admin").emit("order:cancelled", {
        orderId: order._id,
        orderStatus: "Cancelled",
      });

      // Emit stock updates for restored products
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
    console.error("Error in orderController.js:", socketError);
      console.error("[Socket] Error emitting order:cancelled:", socketError.message);
    }

    // Cache invalidation: clear product detail/list caches after stock restoration
    for (const item of order.items) {
      await deleteCache(`products:detail:${item.product}`);
    }
    await deleteCachePattern("products:list:*");
    await deleteCache("homepage:featured");

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Error in orderController.js:", error);
    if (error.assessment) {
      return res.status(error.statusCode || 400).json({
        success: false,
        message: error.assessment.shortMessage,
        assessment: error.assessment,
      });
    }

    return res.status(error.statusCode || 500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
  getOrderById,
  cancelOrder
};
