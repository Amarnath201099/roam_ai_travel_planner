const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    destination: { type: String, required: true },
    days: { type: Number, required: true },
    budgetTier: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    interests: [{ type: String }],

    // Base Truth
    itinerary: [
      {
        day: { type: Number },
        activities: [
          {
            time: { type: String },
            description: { type: String },
            location: { type: String },
          },
        ],
      },
    ],
    hotelSuggestions: [
      {
        name: { type: String },
        tier: { type: String },
        description: { type: String },
      },
    ],
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

    // --- NEW: Version Control & State ---
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
