const mongoose = require("mongoose");

const paymentItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    recipientName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const paymentAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [paymentItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
      type: String,
      enum: ["UPI", "Card", "Netbanking", "Wallet"],
      required: true,
    },
    shippingCharge: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["created", "failed", "completed"],
      default: "created",
    },
  },
  { timestamps: true }
);

const PaymentAttempt = mongoose.model("PaymentAttempt", paymentAttemptSchema);

module.exports = PaymentAttempt;
