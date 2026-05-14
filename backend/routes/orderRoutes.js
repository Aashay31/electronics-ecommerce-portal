const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  placeOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
} = require("../controllers/orderController");

const router = express.Router();

router.use(authMiddleware);

router.post("/", placeOrder);
router.get("/myorders", getUserOrders);
router.get("/:id", getOrderById);
router.put("/:id/cancel", cancelOrder);

module.exports = router;
