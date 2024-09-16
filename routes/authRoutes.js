// // routes/authRoutes.js
// const express = require("express");
// const { register } = require("../controllers/authController");
// const upload = require("multer")(); // Multer for image handling
// const router = express.Router();

// router.post("/register", upload.single("profile_pic"), register);

// // Add login, verify-otp, etc.

// module.exports = router;

// routes/authRoutes.js
const express = require("express");
const {
  register,
  login,
  verifyOtp,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const upload = require("../middleware/upload"); // Assuming multer is used for file upload
const router = express.Router();

// Registration
router.post("/register", upload.single("profile_pic"), register);
// router.post("/register", register);

// Login
router.post("/login", login);

// OTP verification after registration
router.post("/verify-otp", verifyOtp);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password with OTP
router.post("/reset-password", resetPassword);

module.exports = router;
