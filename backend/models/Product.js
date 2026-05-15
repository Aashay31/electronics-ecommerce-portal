const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  category: {
    type: String,
    required: true,
  },

  stock: {
    type: Number,
    required: true,
  },

  imageUrl: {
  type: String,
  default:
    "https://www.thingbits.in/_next/image?url=https%3A%2F%2Fimages.thingbits.net%2FeyJidWNrZXQiOiJ0aGluZ2JpdHMtbmV0Iiwia2V5IjoiMmc5dDAyY2FkYWdwZmp1c3NyeWUxd2t6aHIycCIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6MTMwMCwiaGVpZ2h0Ijo5NzUsImZpdCI6ImNvdmVyIn19fQ%3D%3D&w=3840&q=75",
},

  featured: {
    type: Boolean,
    default: false,
  },

  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },

  ratingCount: {
    type: Number,
    default: 0,
  },

  soldCount: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;