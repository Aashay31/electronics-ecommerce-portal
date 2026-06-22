const express = require("express");
const { signup, login, forgotPassword, resetPassword } = require("../controllers/authController");
const { validateNestedLength } = require("../middleware/validationMiddleware");

const router = express.Router();

router.post("/signup", validateNestedLength("address", { street: 200, city: 200, state: 200, country: 200, pincode: 200 }), signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

module.exports = router;
