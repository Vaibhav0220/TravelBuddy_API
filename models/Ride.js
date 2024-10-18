// models/Ride.js
const mongoose = require("mongoose");

const RideSchema = new mongoose.Schema({
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  vehicle_id: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  departure_time: { type: Date, required: true },
  price_per_seat: { type: Number, required: true },
  arrival_time: { type: Date, required: true },
  available_seats: { type: Number, required: true },
  available_seats: { type: Number, required: true },
});

module.exports = mongoose.model("Ride", RideSchema);
