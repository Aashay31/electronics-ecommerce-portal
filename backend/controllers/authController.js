const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const welcomeTemplate = require("../templates/welcomeTemplate");
const resetPasswordTemplate = require("../templates/resetPasswordTemplate");
const signup = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      password,
      address,
    } = req.body;

    if (!fullName || !email || !phoneNumber || !password || !address) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const requiredAddressFields = [
      "street",
      "city",
      "state",
      "pincode",
      "country",
    ];

    const missingAddressField = requiredAddressFields.find(
      (field) => !address[field]
    );

    if (missingAddressField) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required address fields",
      });
    }

    const phoneExists = await User.findOne({ phoneNumber });
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists, please login",
      });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password,
      address,
    });

    // Send Welcome Email
    try {
      const loginUrl = `${process.env.FRONTEND_URL}/login`;
      await sendEmail({
        email: user.email,
        subject: "Welcome to ElectroMart!",
        html: welcomeTemplate(user.fullName, loginUrl),
      });
    } catch (err) {
    console.error("Error in authController.js:", err);
      console.error("Email could not be sent:", err);
    }

    const token = generateToken(user._id, user.role);
    const safeUser = user.toObject();
    delete safeUser.password;

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Error in authController.js:", error);
    return console.error("Error in authController.js:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;

    if ((!email && !phoneNumber) || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email or phone number and password",
      });
    }

    const lookup = email
      ? { email: email.toLowerCase() }
      : { phoneNumber };
    const user = await User.findOne(lookup).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Contact support.",
      });
    }

    const token = generateToken(user._id, user.role);
    const safeUser = user.toObject();
    delete safeUser.password;

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Error in authController.js:", error);
    return console.error("Error in authController.js:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "There is no user with that email" });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        html: resetPasswordTemplate(user.fullName, resetUrl),
      });

      return res.status(200).json({ success: true, message: "Email sent" });
    } catch (err) {
    console.error("Error in authController.js:", err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ success: false, message: "Email could not be sent" });
    }
  } catch (error) {
    console.error("Error in authController.js:", error);
    return console.error("Error in authController.js:", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again.",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in authController.js:", error);
    return console.error("Error in authController.js:", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again.",
    });
  }
};

module.exports = { signup, login, forgotPassword, resetPassword };
