const User = require("../models/User");
const Product = require("../models/Product");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("wishlistItems")
      .populate("cartItems.product");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, address } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      const phoneExists = await User.findOne({ phoneNumber });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: "Phone number already exists",
        });
      }
      user.phoneNumber = phoneNumber;
    }

    if (fullName) {
      user.fullName = fullName;
    }

    if (address) {
      user.address = {
        street: address.street || user.address?.street || "",
        city: address.city || user.address?.city || "",
        state: address.state || user.address?.state || "",
        pincode: address.pincode || user.address?.pincode || "",
        country: address.country || user.address?.country || "",
      };
    }

    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlistItems");

    return res.status(200).json({
      success: true,
      wishlist: user?.wishlistItems || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

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
    if (!user.wishlistItems.includes(productId)) {
      user.wishlistItems.push(productId);
      await user.save();
    }

    const populated = await User.findById(req.user.id).populate("wishlistItems");
    return res.status(200).json({
      success: true,
      wishlist: populated.wishlistItems || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);
    user.wishlistItems = user.wishlistItems.filter(
      (item) => item.toString() !== productId
    );
    await user.save();

    const populated = await User.findById(req.user.id).populate("wishlistItems");
    return res.status(200).json({
      success: true,
      wishlist: populated.wishlistItems || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    return res.status(200).json({
      success: true,
      addresses: user?.savedAddresses || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addAddress = async (req, res) => {
  try {
    const { label, street, city, state, pincode, country, isDefault } = req.body;

    if (!street || !city || !state || !pincode || !country) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required address fields",
      });
    }

    const user = await User.findById(req.user.id);
    const nextAddress = {
      label: label || "Address",
      street,
      city,
      state,
      pincode,
      country,
      isDefault: Boolean(isDefault),
    };

    if (!user.savedAddresses.length || nextAddress.isDefault) {
      user.savedAddresses.forEach((entry) => {
        entry.isDefault = false;
      });
      nextAddress.isDefault = true;
    }

    user.savedAddresses.push(nextAddress);
    await user.save();

    return res.status(201).json({
      success: true,
      addresses: user.savedAddresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { label, street, city, state, pincode, country, isDefault } = req.body;

    const user = await User.findById(req.user.id);
    const address = user.savedAddresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (label !== undefined) address.label = label;
    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (pincode) address.pincode = pincode;
    if (country) address.country = country;

    if (isDefault) {
      user.savedAddresses.forEach((entry) => {
        entry.isDefault = entry.id === addressId;
      });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      addresses: user.savedAddresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    const address = user.savedAddresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const wasDefault = address.isDefault;
    address.remove();

    if (wasDefault && user.savedAddresses.length) {
      user.savedAddresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      addresses: user.savedAddresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    const address = user.savedAddresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    user.savedAddresses.forEach((entry) => {
      entry.isDefault = entry.id === addressId;
    });

    await user.save();

    return res.status(200).json({
      success: true,
      addresses: user.savedAddresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
