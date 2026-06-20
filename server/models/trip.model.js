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

    // Structured JSON data matching expected Gemini LLM generation schema
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

    // Custom Feature: Actual Costs Tracking vs AI Estimations
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
  },
  { timestamps: true },
);

module.exports = mongoose.model("Trip", tripSchema);
