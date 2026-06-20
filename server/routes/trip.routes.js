const express = require("express");
const router = express.Router();
const {
  generateTrip,
  getUserTrips,
  getTripById,
  addExpense,
} = require("../controllers/trip.controller.js");
const { protect } = require("../middleware/auth.middleware.js");

// Apply the auth protection middleware globally to all routes in this router
router.use(protect);

// Standard REST pattern mapping for Trip resource
router.route("/").post(generateTrip).get(getUserTrips);

router.route("/:id").get(getTripById);

// Custom endpoint for modifying the actualExpenses array
router.post("/:id/expenses", addExpense);

module.exports = router;
