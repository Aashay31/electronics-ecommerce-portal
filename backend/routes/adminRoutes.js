const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/upload");
const { validateLength } = require("../middleware/validationMiddleware");
const {
  getStats,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  getUsers,
  getUserDetail,
  changeUserRole,
  toggleBanUser,
  deleteUser,
  getReviews,
  deleteReview,
  getReviewAnalytics,
} = require("../controllers/adminController");

const router = express.Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// Dashboard
router.get("/stats", getStats);

// Products
router.get("/products", getProducts);
router.post("/products", upload.single("image"), validateLength({ productName: 150, description: 2000 }), createProduct);
router.put("/products/:id", upload.single("image"), validateLength({ productName: 150, description: 2000 }), updateProduct);
router.delete("/products/:id", deleteProduct);

// Orders
router.get("/orders", getOrders);
router.put("/orders/:userId/:orderId", updateOrderStatus);

// Users
router.get("/users", getUsers);
router.get("/users/:id", getUserDetail);
router.put("/users/:id/role", changeUserRole);
router.put("/users/:id/ban", toggleBanUser);
router.delete("/users/:id", deleteUser);

// Reviews
router.get("/reviews", getReviews);
router.get("/reviews/analytics", getReviewAnalytics);
router.delete("/reviews/:productId/:reviewId", deleteReview);

module.exports = router;
