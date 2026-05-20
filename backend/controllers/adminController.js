const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const sendEmail = require("../utils/sendEmail");
const statusTemplate = require("../templates/statusTemplate");

// ─── Dashboard Stats ────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
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

    return res.status(200).json({
      success: true,
      stats: {
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
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const buildRatingStats = (reviews = []) => {
  const totalReviews = reviews.length;
  if (!totalReviews) {
    return { averageRating: 0, totalReviews: 0 };
  }
  const averageRating =
    reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
    totalReviews;
  return { averageRating: Number(averageRating.toFixed(2)), totalReviews };
};

// ─── Product Management ─────────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.productName = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { productName, description, price, category, stock, imageUrl, featured } = req.body;

    if (!productName || !description || price == null || !category || stock == null) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Determine image URL: uploaded file takes priority over a URL string
    let finalImageUrl;
    if (req.file) {
      finalImageUrl = `/uploads/products/${req.file.filename}`;
    } else if (imageUrl) {
      finalImageUrl = imageUrl;
    }

    const product = await Product.create({
      productName,
      description,
      price,
      category,
      stock,
      imageUrl: finalImageUrl || undefined,
      featured: featured === "true" || featured === true,
    });

    return res.status(201).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const updates = { ...req.body };

    // Convert featured string from FormData to boolean
    if (updates.featured !== undefined) {
      updates.featured = updates.featured === "true" || updates.featured === true;
    }

    // Handle image: uploaded file takes priority
    if (req.file) {
      // Delete old uploaded image from disk if it was a local upload
      if (product.imageUrl && product.imageUrl.startsWith("/uploads/")) {
        const oldPath = path.join(__dirname, "..", product.imageUrl);
        fs.unlink(oldPath, () => {}); // fire-and-forget
      }
      updates.imageUrl = `/uploads/products/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: "after",
      runValidators: true,
    });

    return res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Order Management ───────────────────────────────────────────────
const getOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) {
      query.orderStatus = status;
    }

    // Populate user to allow searching by user name/email
    let orders = await Order.find(query)
      .populate("user", "fullName email")
      .populate("items.product", "productName imageUrl")
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      orders = orders.filter((o) => 
        o.user?.fullName.toLowerCase().includes(s) || 
        o.user?.email.toLowerCase().includes(s)
      );
    }

    orders = orders.filter(
      (o) =>
        o.paymentMethod === "Cash on Delivery" ||
        (o.paymentStatus === "Paid" && o.razorpayPaymentId)
    );

    const total = orders.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedOrders = orders.slice(skip, skip + Number(limit));

    // Map to expected frontend structure to maintain compatibility
    const formattedOrders = paginatedOrders.map(o => {
      const obj = o.toObject();
      obj.customerName = o.user?.fullName;
      obj.customerEmail = o.user?.email;
      obj.userId = o.user?._id;
      // Convert backend variables to frontend expected fields
      obj.total = o.totalAmount;
      obj.orderedAt = o.createdAt;
      obj.deliveryStatus = o.orderStatus;
      obj.paymentMethod = o.paymentMethod;
      obj.paymentStatus = o.paymentStatus;
      obj.transactionId = o.razorpayPaymentId || o.razorpayOrderId || null;
      obj.cancellationReason = o.cancellationReason || null;
      return obj;
    });

    return res.status(200).json({
      success: true,
      orders: formattedOrders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    // Frontend passes /orders/:userId/:orderId but we only need orderId now
    const { orderId } = req.params;
    const { deliveryStatus, cancellationReason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (deliveryStatus) {
      const wasCancelled = order.orderStatus === "Cancelled";
      order.orderStatus = deliveryStatus;
      if (deliveryStatus === "Delivered" && order.paymentStatus === "Pending") {
        order.paymentStatus = "Paid";
      }
      if (deliveryStatus === "Cancelled") {
        order.cancellationReason = cancellationReason || order.cancellationReason || "Admin override";
        order.cancelledBy = "admin";
        order.cancelledAt = new Date();
        if (!wasCancelled) {
          for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: item.quantity },
            });
          }
        }
      }
    }

    await order.save();

    // Send status update email
    try {
      const user = await User.findById(order.user);
      const statusUrl = `${process.env.FRONTEND_URL}/profile`;
      await sendEmail({
        email: user.email,
        subject: `Order Status Update: ${deliveryStatus} - ElectroMart`,
        html: statusTemplate(order, user.fullName, statusUrl),
      });
    } catch (err) {
      console.error("Order status update email could not be sent:", err);
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── User Management ────────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      query.role = role;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("wishlistItems")
      .populate("orderHistory.items.product");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { returnDocument: "after" }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const toggleBanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: "Cannot ban yourself" });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({ success: true, user: safeUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Review Management ─────────────────────────────────────────────
const getReviews = async (req, res) => {
  try {
    const { search, rating, sort = "recent", page = 1, limit = 10 } = req.query;
    const safeLimit = Math.min(Number(limit) || 10, 50);
    const pageNumber = Math.max(Number(page) || 1, 1);
    const skip = (pageNumber - 1) * safeLimit;

    const matchStage = {};
    if (rating) {
      matchStage["reviews.rating"] = Number(rating);
    }

    const searchRegex = search ? new RegExp(search, "i") : null;

    const pipeline = [
      { $unwind: "$reviews" },
      {
        $lookup: {
          from: "users",
          localField: "reviews.user",
          foreignField: "_id",
          as: "reviewUser",
        },
      },
      {
        $unwind: {
          path: "$reviewUser",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    if (searchRegex) {
      pipeline.push({
        $match: {
          $or: [
            { productName: searchRegex },
            { "reviews.title": searchRegex },
            { "reviews.comment": searchRegex },
            { "reviewUser.fullName": searchRegex },
            { "reviewUser.email": searchRegex },
          ],
        },
      });
    }

    let sortStage = { "reviews.createdAt": -1 };
    if (sort === "highest") {
      sortStage = { "reviews.rating": -1, "reviews.createdAt": -1 };
    }
    if (sort === "lowest") {
      sortStage = { "reviews.rating": 1, "reviews.createdAt": -1 };
    }
    if (sort === "helpful") {
      sortStage = { "reviews.helpfulCount": -1, "reviews.createdAt": -1 };
    }

    pipeline.push({ $sort: sortStage });
    pipeline.push({
      $facet: {
        data: [
          { $skip: skip },
          { $limit: safeLimit },
          {
            $project: {
              productId: "$_id",
              productName: 1,
              imageUrl: 1,
              reviewId: "$reviews._id",
              rating: "$reviews.rating",
              title: "$reviews.title",
              comment: "$reviews.comment",
              verifiedPurchase: "$reviews.verifiedPurchase",
              helpfulCount: "$reviews.helpfulCount",
              createdAt: "$reviews.createdAt",
              userId: "$reviewUser._id",
              userName: "$reviewUser.fullName",
              userEmail: "$reviewUser.email",
            },
          },
        ],
        total: [{ $count: "count" }],
      },
    });

    const result = await Product.aggregate(pipeline);
    const data = result[0]?.data || [];
    const total = result[0]?.total?.[0]?.count || 0;

    return res.status(200).json({
      success: true,
      reviews: data,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / safeLimit) || 1,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    review.deleteOne();
    const stats = buildRatingStats(product.reviews || []);
    product.averageRating = stats.averageRating;
    product.totalReviews = stats.totalReviews;
    product.rating = stats.averageRating;
    product.ratingCount = stats.totalReviews;
    await product.save();

    return res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getReviewAnalytics = async (req, res) => {
  try {
    const topReviewed = await Product.find({ totalReviews: { $gt: 0 } })
      .select("productName imageUrl totalReviews averageRating")
      .sort({ totalReviews: -1 })
      .limit(5);

    const lowestRated = await Product.find({ totalReviews: { $gt: 0 } })
      .select("productName imageUrl totalReviews averageRating")
      .sort({ averageRating: 1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      analytics: {
        topReviewed,
        lowestRated,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStats,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  getUsers,
  getUserDetail,
  changeUserRole,
  toggleBanUser,
  deleteUser,
  getReviews,
  deleteReview,
  getReviewAnalytics,
};
