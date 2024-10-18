
const express = require("express");
const {
  register,
  login,
  verifyOtp,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const upload = require("../middleware/upload"); 
const router = express.Router();

router.post("/register", upload.single("profile_pic"), register);

router.post("/login", login);

router.post("/verify-otp", verifyOtp);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

module.exports = router;
