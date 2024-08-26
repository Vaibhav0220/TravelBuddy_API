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
router.post("/getRideById", auth, getRideById);
router.post("/rateDriver", auth, rateDriver);
router.post("/reportDriver", auth, reportDriver);

module.exports = router;
