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
    return res.status(500).json({
      success: false,
      message: error.message,
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

    const user = await User.findById(req.user.id);
    const existingItem = user.cartItems.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += normalizedQuantity;
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
    return res.status(500).json({
      success: false,
      message: error.message,
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
    return res.status(500).json({
      success: false,
      message: error.message,
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
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
};
