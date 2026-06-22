const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    time: { type: String, required: true },
    title: { type: String, required: true }, // NEW: Short name of the activity
    description: { type: String, required: true }, // Re-purposed: A 1-2 sentence detailed description
    location: { type: String, required: true },
    tags: [{ type: String }], // NEW: e.g., ["Historic", "Nature", "Photography"]
  },
  { _id: true },
);

const daySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    activities: [activitySchema],
  },
  { _id: true },
);

// NEW: Day-wise packing list schema
const packingSchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    items: [{ type: String }], // e.g., ["Comfortable walking shoes", "Sunscreen", "Camera"]
  },
  { _id: false },
);

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    tier: { type: String, required: true },
    description: { type: String, required: true },
    rating: { type: String }, // NEW: e.g., "4.8"
    dietaryOptions: { type: String }, // NEW: e.g., "Pure Veg", "Both", "Vegan Available"
    specialDishes: [{ type: String }], // NEW: e.g., ["Wood-fired Pizza", "Local Truffle Pasta"]
  },
  { _id: true },
);

const tripSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    destination: { type: String, required: true },
    days: { type: Number, required: true },
    budgetTier: { type: String, required: true },
    interests: [{ type: String }],

    // Core AI Data
    itinerary: [daySchema],
    packingList: [packingSchema], // NEW
    hotelSuggestions: [hotelSchema], // EXPANDED

    estimatedBudget: {
      flights: { type: Number, default: 0 },
      accommodation: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      activities: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },

    // Tracking & Version Control
    isFinalized: { type: Boolean, default: false },
    versionHistory: [
      { type: mongoose.Schema.Types.ObjectId, ref: "TripVersion" },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Trip", tripSchema);
