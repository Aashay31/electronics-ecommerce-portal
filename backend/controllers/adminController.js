const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// ─── Dashboard Stats ────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ role: "user" });
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 5 } });

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: "Pending" });
    const orders = await Order.find();
    
    let totalRevenue = 0;
    orders.forEach((order) => {
      totalRevenue += order.totalAmount || 0;
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue,
        pendingOrders,
        lowStockProducts,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
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

    const product = await Product.create({
      productName,
      description,
      price,
      category,
      stock,
      imageUrl: imageUrl || undefined,
      featured: Boolean(featured),
    });

    return res.status(201).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, product });
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
    const { deliveryStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (deliveryStatus) {
      order.orderStatus = deliveryStatus;
      if (deliveryStatus === "Delivered" && order.paymentStatus === "Pending") {
        order.paymentStatus = "Paid";
      }
    }

    await order.save();

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
      { new: true }
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
};
