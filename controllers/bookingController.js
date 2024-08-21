// controllers/bookingController.js
const Booking = require("../models/Booking");
const Ride = require("../models/Ride");

// Create a new booking
exports.createBooking = async (req, res) => {
  const { ride_id, seats_booked } = req.body;

  try {
    const ride = await Ride.findById(ride_id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    // Ensure enough seats are available
    if (ride.available_seats < seats_booked) {
      return res.status(400).json({ message: "Not enough seats available" });
    }

    // Create booking
    const newBooking = new Booking({
      ride_id,
      passenger_id: req.user._id,
      seats_booked,
    });

    await newBooking.save();

    // Update available seats
    ride.available_seats -= seats_booked;
    await ride.save();

    res.status(201).json({
      message: "Booking created successfully",
      bookingID: newBooking._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all bookings for a user
exports.getUserBookings = async (req, res) => {
  const { sortField, sortValue } = req.body;

  try {
    const bookings = await Booking.find({ passenger_id: req.user._id }).sort({
      [sortField]: sortValue,
    });
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
