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
        .status(201)
        .json({ message: "Ride created successfully", rideID: newRide._id });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
];

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

exports.rateDriver = async (req, res) => {
  const { ride_id, driver_id, rating } = req.body;

  try {
    // Validate rating value
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    // Find the ride
    const ride = await Ride.findById(ride_id);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // Check if the driver exists
    const driver = await User.findById(driver_id);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Add the rating (you could store an array of ratings or update an average)
    driver.ratings = driver.ratings || [];
    driver.ratings.push({ ride_id, rating });

    // Save the updated driver data
    await driver.save();

    res.status(200).json({ message: "Driver rated successfully" });
  } catch (err) {
    console.error("Error rating driver:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.reportDriver = async (req, res) => {
  const { ride_id, driver_id, report } = req.body;

  try {
    // Validate report text
    if (!report || report.trim().length === 0) {
      return res.status(400).json({ message: "Report message is required" });
    }

    // Find the ride
    const ride = await Ride.findById(ride_id);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // Check if the driver exists
    const driver = await User.findById(driver_id);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Add the report (could store in an array or log it somewhere)
    driver.reports = driver.reports || [];
    driver.reports.push({ ride_id, report });

    // Save the updated driver data
    await driver.save();

    res.status(200).json({ message: "Report submitted successfully" });
  } catch (err) {
    console.error("Error reporting driver:", err);
    res.status(500).json({ message: err.message });
  }
};
