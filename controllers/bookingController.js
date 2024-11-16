// // controllers/bookingController.js
// const Booking = require("../models/Booking");
// const { body, validationResult } = require("express-validator");

// // Create a new booking
// exports.createBooking = [
//   body("user_id").notEmpty().withMessage("User ID is required"),
//   body("ride_id").notEmpty().withMessage("Ride ID is required"),
//   body("seats")
//     .isInt({ min: 1 })
//     .withMessage("Number of seats must be at least 1"),

//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       console.log("Validation errors:", errors.array());
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { user_id, ride_id, seats } = req.body;
//     try {
//       const booking = new Booking({
//         user_id,
//         ride_id,
//         seats,
//       });
//       await booking.save();
//       res.status(201).json({
//         message: "Booking created successfully",
//         bookingID: booking._id,
//       });
//     } catch (err) {
//       console.error("Error creating booking:", err);
//       res.status(500).json({ message: err.message });
//     }
//   },
// ];

// // Get all bookings for a user
// exports.getUserBookings = async (req, res) => {
//   const { sortField = "_id", sortValue = "asc" } = req.query; // Use query parameters for sorting

//   // Validate sortField and sortValue
//   if (!["_id", "user_id", "ride_id", "seats"].includes(sortField)) {
//     return res.status(400).json({ error: "Invalid sort field" });
//   }
//   if (!["asc", "desc"].includes(sortValue)) {
//     return res.status(400).json({ error: "Invalid sort value" });
//   }

//   try {
//     const bookings = await Booking.find({ user_id: req.user._id }).sort({
//       [sortField]: sortValue === "asc" ? 1 : -1,
//     });
//     res.status(200).json(bookings);
//   } catch (err) {
//     console.error("Error retrieving bookings:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

const Booking = require("../models/Booking");
const Ride = require("../models/Ride");
const { body, validationResult } = require("express-validator");

// Create a new booking
exports.createBooking = [
    body("user_id").notEmpty().withMessage("User ID is required"),
    body("ride_id").notEmpty().withMessage("Ride ID is required"),
    body("seats").isInt({ min: 1 }).withMessage("Number of seats must be at least 1"),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log("Validation errors:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { user_id, ride_id, seats, rideData } = req.body;

        console.log("req.body", JSON.stringify(req.body, null, 2));

        // return;
        try {
            const booking = new Booking({
                user_id,
                ride_id,
                seats,
                rideData: JSON.stringify(req.body.rideData),
            });

            console.log("booking", booking);
            await booking.save();
            res.status(201).json({
                message: "Booking created successfully",
                bookingID: booking._id,
            });
        } catch (err) {
            console.error("Error creating booking:", err);
            res.status(500).json({ message: err.message });
        }
    },
];

// Get all bookings for a user

exports.getUserBookings = async (req, res) => {
    const { sortField = "_id", sortValue = "asc", searchValue = null } = req.body;

    // Validate sortField and sortValue
    if (!["_id", "user_id", "ride_id", "seats"].includes(sortField)) {
        return res.status(400).json({ error: "Invalid sort field" });
        console.log("req.body", JSON.stringify(req.body, null, 2));
    }

    try {
        // Initialize filter with the mandatory user_id
        const filter = { user_id: req.user._id };

        // If searchValue is not null or an empty object, add it to the filter
        if (searchValue && Object.keys(searchValue).length > 0) {
            Object.assign(filter, searchValue);
        }

        // Retrieve the bookings with sorting and filtering
        const bookings = await Booking.find(filter).sort({
            [sortField]: sortValue === "asc" ? 1 : -1,
        });
        let temp = [];
        bookings.map((item) => {
            temp.push({
                _id: item._id,
                user_id: item.user_id,
                ride_id: item.ride_id,
                seats: item.seats,
                rideData: JSON.parse(item.rideData),
            });
        });

        res.status(200).json({ temp });
    } catch (err) {
        console.error("Error retrieving bookings:", err);
        res.status(500).json({ message: err.message });
    }
};

// exports.getUserBookings = async (req, res) => {
//   const { sortField = "_id", sortValue = "asc" } = req.query;

//   // Validate sortField and sortValue
//   if (!["_id", "user_id", "ride_id", "seats"].includes(sortField)) {
//     return res.status(400).json({ error: "Invalid sort field" });
//   }
//   if (!["asc", "desc"].includes(sortValue)) {
//     return res.status(400).json({ error: "Invalid sort value" });
//   }

//   try {
//     const bookings = await Booking.find({ user_id: req.user._id }).sort({
//       [sortField]: sortValue === "asc" ? 1 : -1,
//     });
//     res.status(200).json(bookings);
//   } catch (err) {
//     console.error("Error retrieving bookings:", err);
//     res.status(500).json({ message: err.message });
//   }
// };
