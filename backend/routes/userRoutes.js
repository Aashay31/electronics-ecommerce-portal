const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
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
router.put("/me", authMiddleware, updateProfile);
router.put("/me/password", authMiddleware, updatePassword);


router.get("/me/wishlist", authMiddleware, getWishlist);
router.post("/me/wishlist", authMiddleware, addToWishlist);
router.delete("/me/wishlist/:productId", authMiddleware, removeFromWishlist);

router.get("/me/addresses", authMiddleware, getAddresses);
router.post("/me/addresses", authMiddleware, addAddress);
router.put("/me/addresses/:addressId", authMiddleware, updateAddress);
router.delete("/me/addresses/:addressId", authMiddleware, deleteAddress);
router.put(
  "/me/addresses/:addressId/default",
  authMiddleware,
  setDefaultAddress
);

module.exports = router;
