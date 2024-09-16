// controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sharp = require("sharp");
const axios = require("axios");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const multer = require("multer");
const upload = require("../middleware/upload");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const { ClientRequest } = require("http");

// Nodemailer configuration
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

async function sendOTP(email, otp, mailOptionAlt) {
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
    await transporter.sendMail(
      mailOptionAlt == null ? mailOptions : mailOptionAlt
    );
    return otp;
  } catch (error) {
    console.error("Error sending email: ", error);
  }
}

// Registration

exports.register = async (req, res) => {
  console.table(req.body);
  const { name, email, password, phone_number } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(403).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    let profile_pic_url;

    if (req.file) {
      const file = req.file;
      // const encoded = req.file.buffer.toString("base64");

      // console.log("Image file being sent:", file.originalname);

      let headers = {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      };
      try {
        const postResponse = await axios
          .post(
            `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
            file,
            {
              headers: headers,
            }
          )
          .then(function (result) {
            return result;
          })
          .catch((err) => err.response);

        // const imgBBResponse = await axios.post(
        //   `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        //   form
        // );
        console.log("imgBBResponse: ", postResponse);
        profile_pic_url = imgBBResponse.data.data.url;
      } catch (error) {
        console.error("Error uploading image: ", error);
        throw new Error("Error uploading image");
      }
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
      expiresIn: "24h",
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
    sendOTP(email, otp, mailOptions);

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

// exports.register = async (req, res) => {
//   console.log(req.body);
//   upload(req, res, async (err) => {
//     if (err) {
//       return res.status(500).json({ message: "Error uploading file." });
//     }

//     const { name, email, password, phone_number } = req.body;

//     try {
//       const existingUser = await User.findOne({ email });
//       if (existingUser) {
//         return res.status(403).json({ message: "User already exists" });
//       }

//       const hashedPassword = await bcrypt.hash(password, 10);
//       let profile_pic_url =
//         "https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg";

//       if (req.file) {
//         const compressedImage = await sharp(req.file.buffer)
//           .resize(150, 150)
//           .toBuffer();
//         const imgBBResponse = await axios.post(
//           `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
//           {
//             image: compressedImage.toString("base64"),
//           }
//         );
//         profile_pic_url = imgBBResponse.data.data.url;
//       }

//       const otp = Math.floor(100000 + Math.random() * 900000).toString();

//       // Send OTP (You can uncomment this if you have the mailer setup)
//       // const mailOptions = {
//       //   from: process.env.EMAIL_USER,
//       //   to: email,
//       //   subject: "Your OTP for Travel Buddy Registration",
//       //   text: `Hello ${name},\n\nYour OTP for Travel Buddy registration is: ${otp}.\nPlease verify your account using this OTP.\n\nThank you!`,
//       // };

//       let receiveOTP = await sendOTP(email, otp);

//       const newUser = new User({
//         name,
//         email,
//         password: hashedPassword,
//         phone_number,
//         profile_pic: profile_pic_url,
//         otp,
//         isVerified: false,
//       });

//       await newUser.save();

//       // await transporter.sendMail(mailOptions); // Uncomment if using nodemailer

//       res.status(201).json({
//         message: "User registered successfully. Please verify your OTP.",
//         userID: newUser._id,
//       });
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   });
// };

// router.post("/register", upload.single("file"), async (req, res) => {

// exports.register = async (req, res) => {
//   const { name, email, password, phone_number } = req.body;

//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(403).json({ message: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     let profile_pic_url =
//       "https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg";

//     // Check if file was uploaded
//     if (req.file) {
//       const compressedImage = await sharp(req.file.path)
//         .resize(150, 150)
//         .toBuffer();

//       const imgBBResponse = await axios.post(
//         `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
//         {
//           image: compressedImage.toString("base64"),
//         }
//       );

//       profile_pic_url = imgBBResponse.data.data.url;
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     let receiveOTP = await sendOTP(email, otp);

//     const newUser = new User({
//       name,
//       email,
//       password: hashedPassword,
//       phone_number,
//       profile_pic: profile_pic_url,
//       otp,
//       isVerified: false,
//     });

//     await newUser.save();

//     res.status(201).json({
//       message: "User registered successfully. Please verify your OTP.",
//       userID: newUser._id,
//     });
//   } catch (err) {
//     console.error("Server error: ", err);
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: err.message });
//   }
// };
