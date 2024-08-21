// controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sharp = require("sharp");
const axios = require("axios");

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

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone_number,
      profile_pic: profile_pic_url,
    });
    await newUser.save();

    res
      .status(201)
      .json({ message: "User registered successfully", userID: newUser._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add more auth-related functions here...
