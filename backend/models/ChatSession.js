const mongoose = require("mongoose");

const actionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    action: { type: String, required: true },
    value: { type: String, default: "" },
    variant: { type: String, default: "secondary" },
  },
  { _id: false }
);

const snapshotProductSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    productName: { type: String, required: true },
    category: { type: String, default: "" },
    description: { type: String, default: "" },
    price: { type: Number, default: 0 },
    imageUrl: { type: String, default: "" },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
  },
  { _id: false }
);

const snapshotOrderSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    orderNumber: { type: String, required: true },
    displayLabel: { type: String, default: "" },
    orderStatus: { type: String, default: "" },
    paymentStatus: { type: String, default: "" },
    paymentMethod: { type: String, default: "" },
    totalAmount: { type: Number, default: 0 },
    estimatedDelivery: { type: Date, default: null },
    createdAt: { type: Date, default: null },
    itemCount: { type: Number, default: 0 },
    canCancel: { type: Boolean, default: false },
    cancellation: { type: mongoose.Schema.Types.Mixed, default: null },
    actions: [actionSchema],
    items: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

const richContentSchema = new mongoose.Schema(
  {
    intent: { type: String, default: "general" },
    summary: { type: String, default: "" },
    quickActions: [actionSchema],
    products: [snapshotProductSchema],
    orders: [snapshotOrderSchema],
    comparison: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    quickReplyAction: { type: String, default: "" },
    richContent: { type: richContentSchema, default: () => ({}) },
  },
  { _id: true }
);

const chatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    messages: [messageSchema],
    title: { type: String, default: "ElectroMart Support" },
    summary: { type: String, default: "" },
    lastIntent: { type: String, default: "general" },
    context: {
      activeOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
      activeProductIds: { type: [mongoose.Schema.Types.ObjectId], ref: "Product", default: [] },
      lastResolvedReference: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatSession", chatSessionSchema);
