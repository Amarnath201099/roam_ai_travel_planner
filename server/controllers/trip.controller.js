const Trip = require("../models/trip.model.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Gemini client using the environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to deep-copy the current itinerary into the history queue (Max 5)
const pushToHistory = (trip, title) => {
  // Use JSON parse/stringify to break Mongoose references for a pure snapshot
  const snapshot = JSON.parse(JSON.stringify(trip.itinerary));

  trip.versionHistory.push({
    versionId: Date.now().toString(), // Simple unique ID
    title: title,
    itineraryData: snapshot,
  });

  // Enforce FIFO: If we exceed 5 versions, drop the oldest (index 0)
  if (trip.versionHistory.length > 5) {
    trip.versionHistory.shift();
  }
};

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
 * @desc    Update core trip settings and completely regenerate AI itinerary
 * @route   PUT /api/trips/:id
 * @access  Private
 */
const updateTrip = async (req, res, next) => {
  const { destination, days, budgetTier, interests } = req.body;

  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized or trip not found");
    }

    // System instruction for a full regeneration
    const systemInstruction = `
      You are an expert AI Travel Planner. Generate a structured travel itinerary for a trip to ${destination} for ${days} days.
      Budget: ${budgetTier}. Interests: ${interests ? interests.join(", ") : "general"}.
      
      Return ONLY valid JSON:
      {
        "itinerary": [ { "day": Number, "activities": [ { "time": "String", "description": "String", "location": "String" } ] } ],
        "hotelSuggestions": [ { "name": "String", "tier": "String", "description": "String" } ],
        "estimatedBudget": { "flights": Number, "accommodation": Number, "food": Number, "activities": Number, "total": Number }
      }
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(systemInstruction);
    const aiData = JSON.parse(result.response.text());

    // NEW: Save current state before overwriting
    pushToHistory(trip, "Global Edit: Changed Trip Parameters");

    // Update document properties
    trip.destination = destination;
    trip.days = days;
    trip.budgetTier = budgetTier;
    trip.interests = interests;
    trip.itinerary = aiData.itinerary;
    trip.hotelSuggestions = aiData.hotelSuggestions;
    trip.estimatedBudget = aiData.estimatedBudget;

    // Note: We keep the actualExpenses array intact so they don't lose their receipts!

    const updatedTrip = await trip.save();
    res.status(200).json(updatedTrip);
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
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(systemInstruction);
    const aiData = JSON.parse(result.response.text());

    // NEW: Save current state before overwriting
    pushToHistory(trip, `AI Edit (Day ${dayNumber}): "${userPrompt}"`);

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

/**
 * @desc    Restore an older version of the itinerary
 * @route   PUT /api/trips/:id/restore/:versionId
 * @access  Private
 */
const restoreVersion = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (
      !trip ||
      trip.user.toString() !== req.user._id.toString() ||
      trip.isFinalized
    ) {
      res.status(403);
      throw new Error("Not authorized, trip not found, or trip is finalized");
    }

    const targetVersion = trip.versionHistory.find(
      (v) => v.versionId === req.params.versionId,
    );
    if (!targetVersion) {
      res.status(404);
      throw new Error("Version not found");
    }

    // Save current state before restoring an old one!
    pushToHistory(trip, "Before Restoring Version");

    trip.itinerary = targetVersion.itineraryData;
    await trip.save();

    res.status(200).json(trip);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Merge multiple versions together using AI
 * @route   POST /api/trips/:id/merge
 * @access  Private
 */
const mergeVersions = async (req, res, next) => {
  const { versionIds, userPrompt } = req.body;

  try {
    const trip = await Trip.findById(req.params.id);
    if (
      !trip ||
      trip.user.toString() !== req.user._id.toString() ||
      trip.isFinalized
    ) {
      res.status(403);
      throw new Error("Not authorized or trip is finalized");
    }

    // Extract the exact itinerary arrays the user wants to merge
    const contexts = versionIds
      .map((vId) => {
        const v = trip.versionHistory.find((vh) => vh.versionId === vId);
        return v ? v.itineraryData : null;
      })
      .filter(Boolean);

    if (contexts.length < 2) {
      res.status(400);
      throw new Error("Please provide at least two valid version IDs to merge");
    }

    const systemInstruction = `
      You are an expert AI Travel Planner performing a complex data merge.
      The user is supplying multiple versions of their itinerary (Contexts) and a specific prompt on how to combine them.
      
      User Prompt: "${userPrompt}"
      
      Version A: ${JSON.stringify(contexts[0])}
      Version B: ${JSON.stringify(contexts[1])}
      
      Analyze the contexts, apply the user's logic, and generate a single, unified itinerary.
      You MUST return ONLY valid JSON matching exactly this schema:
      [
        { "day": Number, "activities": [ { "time": "String", "description": "String", "location": "String" } ] }
      ]
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(systemInstruction);
    const mergedItinerary = JSON.parse(result.response.text());

    // Save current state before applying merge
    pushToHistory(trip, `AI Merge: ${userPrompt}`);

    trip.itinerary = mergedItinerary;
    await trip.save();

    res.status(200).json(trip);
  } catch (error) {
    console.error("AI Merge Error:", error);
    res.status(500);
    next(new Error("Failed to merge versions. Please try again."));
  }
};

/**
 * @desc    Finalize the trip, locking edits and clearing history
 * @route   PUT /api/trips/:id/finalize
 * @access  Private
 */
const finalizeTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized or trip not found");
    }

    trip.isFinalized = true;
    trip.versionHistory = []; // Wipe history to commit the final version

    await trip.save();
    res.status(200).json({ message: "Trip finalized", isFinalized: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
