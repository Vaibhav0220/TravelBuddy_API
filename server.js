// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const swaggerDocs = require("./swagger");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
swaggerDocs(app);
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
// Add rideRoutes and bookingRoutes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
