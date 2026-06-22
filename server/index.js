const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db.js");

dotenv.config();
connectDB();

const app = express();

// This tells Express to trust the proxy (Render's load balancer)
// to correctly identify the protocol as HTTPS, which is required
// for cookies with 'secure: true' and 'sameSite: "none"'.
app.set("trust proxy", 1);
// ---------------------

// Middleware
// MUST explicitly define origin and credentials for cookies to work cross-origin
// Parse the environment variable into an array, falling back to localhost
const allowedOrigins = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(",").map((url) => url.trim())
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

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
