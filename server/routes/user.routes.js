const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../controllers/user.controller.js");
const { protect } = require("../middleware/auth.middleware.js");

// Public endpoints for identity instantiation and verification
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected endpoint requiring valid stateless session header signatures
router.get("/profile", protect, getUserProfile);

module.exports = router;
