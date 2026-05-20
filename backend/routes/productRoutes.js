const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
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
router.post("/add", addProduct);


// Get All Products
router.get("/", getAllProducts);


// Get Single Product
router.get("/:id", getSingleProduct);

// Reviews
router.get("/:id/reviews", optionalAuth, getProductReviews);
router.post("/:id/reviews", authMiddleware, addReview);
router.put("/:id/reviews/:reviewId", authMiddleware, updateReview);
router.delete("/:id/reviews/:reviewId", authMiddleware, deleteReview);
router.post("/:id/reviews/:reviewId/helpful", authMiddleware, markReviewHelpful);


module.exports = router;