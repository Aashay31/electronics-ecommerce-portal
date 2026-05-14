const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
} = require("../controllers/cartController");

const router = express.Router();

router.get("/", authMiddleware, getCart);
router.post("/add", authMiddleware, addToCart);
router.put("/:productId", authMiddleware, updateQuantity);
router.delete("/:productId", authMiddleware, removeFromCart);

module.exports = router;
