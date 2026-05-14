const express = require("express");

const {
  addProduct,
  getAllProducts,
  getSingleProduct,
} = require("../controllers/productController");

const router = express.Router();


// Add Product
router.post("/add", addProduct);


// Get All Products
router.get("/", getAllProducts);


// Get Single Product
router.get("/:id", getSingleProduct);


module.exports = router;