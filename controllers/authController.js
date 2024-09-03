// controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sharp = require("sharp");
const axios = require("axios");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Nodemailer configuration
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

async function sendOTP(email, otp) {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // const mailOptions = {
  //   from: process.env.EMAIL_USER,
  //   to: email,
  //   subject: "Your OTP for Password Reset",
  //   text: `Hello ${user.name},\n\nYour OTP for password reset is: ${otp}.\nPlease use this OTP to reset your password.\n\nThank you!`,
  // };

  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return otp;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw error;
  }
}

// Registration
exports.register = async (req, res) => {
  const { name, email, password, phone_number } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    let profile_pic_url = "default-sample-pic-url";

    if (req.file) {
      const compressedImage = await sharp(req.file.buffer)
        .resize(150, 150)
        .toBuffer();
      const imgBBResponse = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        {
          image: compressedImage.toString("base64"),
        }
      );
      profile_pic_url = imgBBResponse.data.data.url;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Send OTP via email
    // const mailOptions = {
    //   from: process.env.EMAIL_USER,
    //   to: email,
    //   subject: "Your OTP for Travel Buddy Registration",
    //   text: `Hello ${name},\n\nYour OTP for Travel Buddy registration is: ${otp}.\nPlease verify your account using this OTP.\n\nThank you!`,
    // };

    let receiveOTP = await sendOTP(email, otp);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone_number,
      profile_pic: profile_pic_url,
      otp,
      isVerified: false,
    });
    await newUser.save();

    // await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "User registered successfully. Please verify your OTP.",
      userID: newUser._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified)
      return res
        .status(400)
        .json({ message: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, userId: user._id, userData: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify OTP after Registration
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    user.isVerified = true;
    user.otp = null;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Forgot Password (send OTP)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Password Reset",
      text: `Hello ${user.name},\n\nYour OTP for password reset is: ${otp}.\nPlease use this OTP to reset your password.\n\nThank you!`,
    };

    // transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset Password with OTP
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp || user.resetPasswordExpires < Date.now())
      return res.status(400).json({ message: "Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
