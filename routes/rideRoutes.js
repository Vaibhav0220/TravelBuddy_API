// routes/rideRoutes.js
const express = require("express");
const {
  createRide,
  getAllRides,
  getRideById,
} = require("../controllers/rideController");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/create", auth, createRide);
router.post("/all", auth, getAllRides);
router.get("/:id", auth, getRideById);

module.exports = router;
