// routes/bookingRoutes.js
const express = require("express");
const {
  createBooking,
  getUserBookings,
} = require("../controllers/bookingController");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/create", auth, createBooking);
router.post("/user", auth, getUserBookings);

module.exports = router;
