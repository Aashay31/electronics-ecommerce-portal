const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { validateLength, validateNestedLength } = require("../middleware/validationMiddleware");
const {
  getProfile,
  updateProfile,
  updatePassword,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/userController");

const router = express.Router();

router.get("/me", authMiddleware, getProfile);
router.put("/me", authMiddleware, validateNestedLength("address", { street: 200, city: 200, state: 200, country: 200, pincode: 200 }), updateProfile);
router.put("/me/password", authMiddleware, updatePassword);


router.get("/me/wishlist", authMiddleware, getWishlist);
router.post("/me/wishlist", authMiddleware, addToWishlist);
router.delete("/me/wishlist/:productId", authMiddleware, removeFromWishlist);

router.get("/me/addresses", authMiddleware, getAddresses);
router.post("/me/addresses", authMiddleware, validateLength({ street: 200, city: 200, state: 200, country: 200, pincode: 200 }), addAddress);
router.put("/me/addresses/:addressId", authMiddleware, validateLength({ street: 200, city: 200, state: 200, country: 200, pincode: 200 }), updateAddress);
router.delete("/me/addresses/:addressId", authMiddleware, deleteAddress);
router.put(
  "/me/addresses/:addressId/default",
  authMiddleware,
  setDefaultAddress
);

module.exports = router;
