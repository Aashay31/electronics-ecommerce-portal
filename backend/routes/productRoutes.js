const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const { validateLength } = require("../middleware/validationMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const optionalAuth = require("../middleware/optionalAuth");
const {
  addProduct,
  getAllProducts,
  getSingleProduct,
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
} = require("../controllers/productController");

const router = express.Router();


// Add Product
router.post("/add", authMiddleware, adminMiddleware, validateLength({ productName: 150, description: 2000 }), addProduct);


// Get All Products
router.get("/", getAllProducts);


// Get Single Product
router.get("/:id", getSingleProduct);

// Reviews
router.get("/:id/reviews", optionalAuth, getProductReviews);
router.post("/:id/reviews", authMiddleware, validateLength({ title: 100, comment: 1000 }), addReview);
router.put("/:id/reviews/:reviewId", authMiddleware, validateLength({ title: 100, comment: 1000 }), updateReview);
router.delete("/:id/reviews/:reviewId", authMiddleware, deleteReview);
router.post("/:id/reviews/:reviewId/helpful", authMiddleware, markReviewHelpful);


module.exports = router;