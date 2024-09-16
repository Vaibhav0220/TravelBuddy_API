// controllers/rideController.js
const Ride = require("../models/Ride");

// Create a new ride
// controllers/rideController.js
const { body, validationResult } = require("express-validator");

exports.createRide = [
  body("driver_id").notEmpty().withMessage("driver ID is required"),
  body("vehicle_id").notEmpty().withMessage("Vehicle ID is required"),
  body("origin").notEmpty().withMessage("Origin is required"),
  body("destination").notEmpty().withMessage("Destination is required"),
  body("departure_time")
    .isISO8601()
    .withMessage("Valid departure time is required"),
  body("price_per_seat")
    .isNumeric()
    .withMessage("Price per seat must be a number"),
  body("available_seats")
    .isInt({ min: 1 })
    .withMessage("Available seats must be at least 1"),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      driver_id,
      vehicle_id,
      origin,
      destination,
      departure_time,
      price_per_seat,
      available_seats,
    } = req.body;
    console.log(driver_id);
    try {
      const newRide = new Ride({
        driver_id,
        vehicle_id,
        origin,
        destination,
        departure_time,
        price_per_seat,
        available_seats,
      });
      await newRide.save();
      res
        .status(200)
        .json({ message: "Ride created successfully", rideID: newRide._id });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
];

// Get all rides (with sorting)
exports.getAllRides = async (req, res) => {
  const { sortField, sortValue, origin, destination } = req.body;

  try {
    let query = {};

    if (origin && destination) {
      query = { origin: origin, destination: destination };
    } else if (origin) {
      query = { origin: origin };
    } else if (destination) {
      query = {
        destination: destination,
      };
    } else {
      query = {};
    }

    const rides = await Ride.find(query).sort({ [sortField]: sortValue });

    let finalRes = { data: rides, noOFrec: rides.length };
    res.status(200).json(finalRes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a ride by ID

exports.getRideById = async (req, res) => {
  try {
    const { id } = req.body; // Extract the ride ID from the request body

    if (!id) {
      return res.status(400).json({ message: "Ride ID is required" });
    }

    const ride = await Ride.findById(id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    res.status(200).json(ride);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// exports.getRideById = async (req, res) => {
//   try {
//     const ride = await Ride.findById(req.params.id);
//     if (!ride) return res.status(404).json({ message: "Ride not found" });

//     res.status(200).json(ride);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
