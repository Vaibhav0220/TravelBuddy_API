// routes/authRoutes.js
const express = require("express");
const { register } = require("../controllers/authController");
const upload = require("multer")(); // Multer for image handling
const router = express.Router();

router.post("/register", upload.single("profile_pic"), register);

// Add login, verify-otp, etc.

module.exports = router;
