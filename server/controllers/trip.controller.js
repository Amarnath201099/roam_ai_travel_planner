const Trip = require("../models/trip.model.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Gemini client using the environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @desc    Generate a new trip using Gemini AI and save to DB
 * @route   POST /api/trips
 * @access  Private
 */
const generateTrip = async (req, res, next) => {
  const { destination, days, budgetTier, interests } = req.body;

  try {
    if (!destination || !days || !budgetTier) {
      res.status(400);
      throw new Error("Destination, days, and budget tier are required");
    }

    // Define the exact JSON schema we expect Gemini to return
    const systemInstruction = `
      You are an expert AI Travel Planner. Generate a structured travel itinerary for a trip to ${destination} for ${days} days.
      The user has a ${budgetTier} budget.
      Their interests include: ${interests ? interests.join(", ") : "general sightseeing"}.
      
      You MUST return ONLY valid JSON matching exactly this schema:
      {
        "itinerary": [
          {
            "day": Number,
            "activities": [
              { "time": "String (e.g., '09:00 AM')", "description": "String", "location": "String" }
            ]
          }
        ],
        "hotelSuggestions": [
          { "name": "String", "tier": "String", "description": "String" }
        ],
        "estimatedBudget": {
          "flights": Number,
          "accommodation": Number,
          "food": Number,
          "activities": Number,
          "total": Number
        }
      }
    `;

    // Use gemini-1.5-flash as it is fast and supports strict JSON mode natively
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(systemInstruction);
    const responseText = result.response.text();

    // Parse the strictly typed JSON response from Gemini
    const aiData = JSON.parse(responseText);

    // Persist the generated trip alongside the user's relational ID
    const trip = await Trip.create({
      user: req.user._id,
      destination,
      days,
      budgetTier,
      interests,
      itinerary: aiData.itinerary,
      hotelSuggestions: aiData.hotelSuggestions,
      estimatedBudget: aiData.estimatedBudget,
      actualExpenses: [], // Initialize empty array for custom tracking feature
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500);
    next(new Error("Failed to generate trip itinerary. Please try again."));
  }
};

/**
 * @desc    Get all trips for the authenticated user
 * @route   GET /api/trips
 * @access  Private
 */
const getUserTrips = async (req, res, next) => {
  try {
    // Fetch trips sorted by newest first, selecting only necessary overview fields
    const trips = await Trip.find({ user: req.user._id })
      .select("destination days budgetTier createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json(trips);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single trip by ID (Ensuring data isolation)
 * @route   GET /api/trips/:id
 * @access  Private
 */
const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      res.status(404);
      throw new Error("Trip not found");
    }

    // Enforce strict authorization data isolation: Users can only view their own trips
    if (trip.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("User not authorized to access this trip");
    }

    res.status(200).json(trip);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an entire trip
 * @route   DELETE /api/trips/:id
 * @access  Private
 */
const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      res.status(404);
      throw new Error("Trip not found");
    }

    if (trip.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("User not authorized to delete this trip");
    }

    await trip.deleteOne();
    res.status(200).json({ message: "Trip removed successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a manual activity to a specific day
 * @route   POST /api/trips/:id/itinerary/:day/activities
 * @access  Private
 */
const addActivity = async (req, res, next) => {
  const { time, description, location } = req.body;
  const dayNumber = parseInt(req.params.day);

  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized or trip not found");
    }

    const dayIndex = trip.itinerary.findIndex((d) => d.day === dayNumber);
    if (dayIndex === -1) {
      res.status(404);
      throw new Error("Day not found in itinerary");
    }

    trip.itinerary[dayIndex].activities.push({ time, description, location });
    await trip.save();

    res.status(201).json(trip.itinerary[dayIndex]);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a specific activity from a specific day
 * @route   DELETE /api/trips/:id/itinerary/:day/activities/:activityId
 * @access  Private
 */
const removeActivity = async (req, res, next) => {
  const dayNumber = parseInt(req.params.day);
  const { activityId } = req.params;

  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized or trip not found");
    }

    const dayIndex = trip.itinerary.findIndex((d) => d.day === dayNumber);
    if (dayIndex === -1) {
      res.status(404);
      throw new Error("Day not found in itinerary");
    }

    // Filter out the specific activity by its Mongoose _id
    trip.itinerary[dayIndex].activities = trip.itinerary[
      dayIndex
    ].activities.filter((act) => act._id.toString() !== activityId);

    await trip.save();
    res.status(200).json(trip.itinerary[dayIndex]);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Regenerate a specific day using AI based on user feedback
 * @route   POST /api/trips/:id/itinerary/:day/regenerate
 * @access  Private
 */
const regenerateDay = async (req, res, next) => {
  const dayNumber = parseInt(req.params.day);
  const { userPrompt } = req.body; // e.g., "Change this to outdoor hiking"

  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized or trip not found");
    }

    // Construct a highly targeted prompt strictly for one day
    const systemInstruction = `
      You are an expert AI Travel Planner modifying a specific day of an existing itinerary.
      Overall Trip Context: Destination: ${trip.destination}, Budget: ${trip.budgetTier}, Interests: ${trip.interests.join(", ")}.
      
      Task: The user wants to RE-GENERATE ONLY Day ${dayNumber}.
      User Custom Request: "${userPrompt}"
      
      You MUST return ONLY valid JSON matching exactly this schema for this single day:
      {
        "day": ${dayNumber},
        "activities": [
          { "time": "String (e.g., '09:00 AM')", "description": "String", "location": "String" }
        ]
      }
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(systemInstruction);
    const aiData = JSON.parse(result.response.text());

    // Find and replace the specific day in the database array
    const dayIndex = trip.itinerary.findIndex((d) => d.day === dayNumber);
    if (dayIndex !== -1) {
      trip.itinerary[dayIndex] = aiData;
    } else {
      trip.itinerary.push(aiData); // Fallback if day somehow didn't exist
    }

    await trip.save();
    res.status(200).json(trip.itinerary[dayIndex]);
  } catch (error) {
    console.error("AI Day Regeneration Error:", error);
    res.status(500);
    next(new Error("Failed to regenerate day. Please try again."));
  }
};

/**
 * @desc    Add an actual expense to a trip (Custom Feature)
 * @route   POST /api/trips/:id/expenses
 * @access  Private
 */
const addExpense = async (req, res, next) => {
  const { category, description, amount } = req.body;

  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      res.status(404);
      throw new Error("Trip not found");
    }

    if (trip.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("User not authorized to modify this trip");
    }

    // Push new expense into the document's array and save
    const expense = { category, description, amount: Number(amount) };
    trip.actualExpenses.push(expense);

    await trip.save();

    res.status(201).json(trip.actualExpenses);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateTrip,
  getUserTrips,
  getTripById,
  deleteTrip,
  addActivity,
  removeActivity,
  regenerateDay,
  addExpense,
};
