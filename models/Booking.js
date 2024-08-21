// models/Booking.js
const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  ride_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ride",
    required: true,
  },
  passenger_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  seats_booked: { type: Number, required: true },
  booked_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", BookingSchema);
