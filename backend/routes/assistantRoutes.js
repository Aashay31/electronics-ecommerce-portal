const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { validateLength } = require("../middleware/validationMiddleware");
const {
  getSession,
  sendMessage,
  clearSession,
  getOrderSupport,
  cancelOrderFromAssistant,
  validateOrderCancellation,
} = require("../controllers/assistantController");

const router = express.Router();

router.use(authMiddleware);

router.get("/session", getSession);
router.post("/message", validateLength({ message: 500 }), sendMessage);
router.delete("/session", clearSession);
router.get("/orders", getOrderSupport);
router.get("/orders/:orderId/validation", validateOrderCancellation);
router.post("/orders/:orderId/cancel", cancelOrderFromAssistant);

module.exports = router;
