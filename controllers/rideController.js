// controllers/rideController.js
const Ride = require("../models/Ride");
const User = require("../models/User");

// Create a new ride
// controllers/rideController.js
const Ride = require("../models/Ride");
const { body, validationResult } = require("express-validator");

// Create a new ride with validation
// exports.createRide = [
//   // Validate fields
//   body('vehicle_id').notEmpty().withMessage('Vehicle ID is required'),
//   body('origin').notEmpty().withMessage('Origin is required'),
//   body('destination').notEmpty().withMessage('Destination is required'),
//   body('departure_time').isISO8601().withMessage('Valid departure time is required'),
//   body('price_per_seat').isNumeric().withMessage('Price per seat must be a number'),
//   body('available_seats').isInt({ min: 1 }).withMessage('Available seats must be at least 1'),

//   // Handle the request after validation
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { vehicle_id, origin, destination, departure_time, price_per_seat, available_seats } = req.body;

//     try {
//       const newRide = new Ride({
//         driver_id: req.user._id,
//         vehicle_id,
//         origin,
//         destination,
//         departure_time,
//         price_per_seat,
//         available_seats,
//       });

//       await newRide.save();
//       res.status(201).json({ message: 'Ride created successfully', rideID: newRide._id });
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   }
// ];

exports.createRide = async (req, res) => {
  const {
    vehicle_id,
    origin,
    destination,
    departure_time,
    price_per_seat,
    available_seats,
  } = req.body;

  try {
    // Ensure driver exists
    const driver = await User.findById(req.user._id);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    // Create the ride
    const newRide = new Ride({
      driver_id: req.user._id,
      vehicle_id,
      origin,
      destination,
      departure_time,
      price_per_seat,
      available_seats,
    });

    await newRide.save();
    res
      .status(201)
      .json({ message: "Ride created successfully", rideID: newRide._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all rides (with sorting)
exports.getAllRides = async (req, res) => {
  const { sortField, sortValue } = req.body;

  try {
    const rides = await Ride.find().sort({ [sortField]: sortValue });
    res.status(200).json(rides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a ride by ID
exports.getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    res.status(200).json(ride);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
