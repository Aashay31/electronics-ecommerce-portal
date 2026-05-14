const User = require("../models/User");
const { generateToken } = require("../utils/jwt");

const signup = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      password,
      profileImage,
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
      profileImage,
      address,
    });

    const token = generateToken(user._id);
    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(201).json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
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

    const token = generateToken(user._id);
    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { signup, login };
