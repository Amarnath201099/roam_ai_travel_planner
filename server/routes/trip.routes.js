const express = require("express");
const router = express.Router();
const {
  generateTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  addActivity,
  removeActivity,
  regenerateDay,
  addExpense,
  restoreVersion,
  mergeVersions,
  finalizeTrip,
} = require("../controllers/trip.controller.js");
const { protect } = require("../middleware/auth.middleware.js");

// Apply the auth protection middleware globally to all routes in this router
router.use(protect);

// Standard REST pattern mapping for Trip resource
router.route("/").post(generateTrip).get(getUserTrips);

router.route("/:id").get(getTripById).put(updateTrip).delete(deleteTrip);

// Custom endpoint for modifying the actualExpenses array
router.post("/:id/expenses", addExpense);

// Add a manual activity to a specific day
router.post("/:id/itinerary/:day/activities", addActivity);

// Remove a specific activity (requires the specific activity's MongoDB _id)
router.delete("/:id/itinerary/:day/activities/:activityId", removeActivity);

// AI Regeneration for a specific day based on a text prompt
router.post("/:id/itinerary/:day/regenerate", regenerateDay);

// Restore a specific version
router.put("/:id/restore/:versionId", restoreVersion);

// Merge multiple versions using AI
router.post("/:id/merge", mergeVersions);

// Finalize the trip (lock document, wipe history)
router.put("/:id/finalize", finalizeTrip);

module.exports = router;
