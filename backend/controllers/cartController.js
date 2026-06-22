const Product = require("../models/Product");
const User = require("../models/User");

const getUserWithCart = async (userId) =>
  User.findById(userId).populate("cartItems.product");

const getCart = async (req, res) => {
  try {
    const user = await getUserWithCart(req.user.id);

    return res.status(200).json({
      success: true,
      cartItems: user.cartItems || [],
    });
  } catch (error) {
    console.error("Error in cartController.js:", error);
    return console.error("Error in cartController.js:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const normalizedQuantity = Number(quantity) || 1;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: `"${product.productName}" is out of stock`,
      });
    }

    const user = await User.findById(req.user.id);
    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId
    );

    const totalRequestedQuantity = existingItem
      ? existingItem.quantity + normalizedQuantity
      : normalizedQuantity;

    if (totalRequestedQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${product.stock} items left)`,
      });
    }

    if (existingItem) {
      existingItem.quantity = totalRequestedQuantity;
    } else {
      user.cartItems.push({ product: productId, quantity: normalizedQuantity });
    }

    await user.save();

    const populatedUser = await getUserWithCart(req.user.id);
    return res.status(200).json({
      success: true,
      cartItems: populatedUser.cartItems || [],
    });
  } catch (error) {
    console.error("Error in cartController.js:", error);
    return console.error("Error in cartController.js:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const normalizedQuantity = Number(quantity);

    if (quantity === undefined || Number.isNaN(normalizedQuantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity is required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (normalizedQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${product.stock} items left)`,
      });
    }

    const user = await User.findById(req.user.id);
    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId
    );

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    if (normalizedQuantity <= 0) {
      user.cartItems = user.cartItems.filter(
        (item) => item.product.toString() !== productId
      );
    } else {
      existingItem.quantity = normalizedQuantity;
    }

    await user.save();

    const populatedUser = await getUserWithCart(req.user.id);
    return res.status(200).json({
      success: true,
      cartItems: populatedUser.cartItems || [],
    });
  } catch (error) {
    console.error("Error in cartController.js:", error);
    return console.error("Error in cartController.js:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);
    user.cartItems = user.cartItems.filter(
      (item) => item.product.toString() !== productId
    );
    await user.save();

    const populatedUser = await getUserWithCart(req.user.id);
    return res.status(200).json({
      success: true,
      cartItems: populatedUser.cartItems || [],
    });
  } catch (error) {
    console.error("Error in cartController.js:", error);
    return console.error("Error in cartController.js:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
};
