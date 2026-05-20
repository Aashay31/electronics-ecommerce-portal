const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createOrder,
  verifyPayment,
  webhookHandler,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/create-order", authMiddleware, createOrder);
router.post("/verify-payment", authMiddleware, verifyPayment);
router.post("/webhook", webhookHandler);

module.exports = router;
