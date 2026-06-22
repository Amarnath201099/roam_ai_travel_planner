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

//  Day-wise packing list schema
const packingSchema = new mongoose.Schema(
  {
    essentials: [{ type: String }],
    dailySuggestions: [
      {
        day: Number,
        items: [{ type: String }],
      },
    ],
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

    startDate: { type: Date, required: true },
    travelGroupType: {
      type: String,
      enum: ["Solo", "Couple", "Family", "Friends"],
      default: "Solo",
    },
    groupSize: { type: Number, default: 1 },

    // Core AI Data
    itinerary: [daySchema],
    packingList: packingSchema,
    hotelSuggestions: [hotelSchema], // EXPANDED

    estimatedBudget: {
      flights: { type: Number, default: 0 },
      accommodation: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      activities: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },

    actualExpenses: [
      {
        category: {
          type: String,
          enum: ["Flights", "Accommodation", "Food", "Activities", "Other"],
        },
        description: { type: String },
        amount: { type: Number, required: true },
        dateAdded: { type: Date, default: Date.now },
      },
    ],

    // Tracking & Version Control
    isFinalized: { type: Boolean, default: false },
    versionHistory: [
      {
        versionId: { type: String, required: true },
        title: { type: String, required: true },
        savedAt: { type: Date, default: Date.now },
        itineraryData: { type: Array, required: true }, // Deep copy snapshot of itinerary
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Trip", tripSchema);
