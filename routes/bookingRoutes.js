// routes/bookingRoutes.js
const express = require("express");
const {
    createBooking,
    getUserBookings,
    postCancelUserRide,
} = require("../controllers/bookingController");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/create", auth, createBooking);
router.post("/user", auth, getUserBookings);
router.post("/cancle", auth, postCancelUserRide);

module.exports = router;
