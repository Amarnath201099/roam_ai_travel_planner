const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db.js");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check API - Verifies server status and environment availability
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date(),
    environment: process.env.NODE_ENV || "development",
    database:
      mongoose.connection.readyState === 1 ? "CONNECTED" : "DISCONNECTED",
  });
});

// Route Mount Placeholders (To be implemented next)
app.use("/api/auth", require("./routes/user.routes.js"));
app.use("/api/trips", require("./routes/trip.routes.js"));

// Centralized Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
