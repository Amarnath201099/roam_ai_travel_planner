const Trip = require("../models/trip.model.js");
const { generateWithFallback } = require("../utils/ai.util.js");
const {
  getGenerateTripPrompt,
  getUpdateTripPrompt,
  getRegenerateDayPrompt,
  getMergeVersionsPrompt,
} = require("../utils/ai-prompts.util.js");

// Helper to deep-copy the current itinerary into the history queue
// We use JSON parse/stringify to break Mongoose object references, creating a pure snapshot
const pushToHistory = (trip, title) => {
  const snapshot = JSON.parse(JSON.stringify(trip.itinerary));

  trip.versionHistory.push({
    versionId: Date.now().toString(), // Simple Unix timestamp works perfectly for a unique ID here
    title: title,
    itineraryData: snapshot,
  });

  // First-In-First-Out (FIFO) Queue: Keep the DB lightweight by capping history at 5 versions
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

    // Fetch the raw prompt string from our decoupled library
    const systemInstruction = getGenerateTripPrompt(
      destination,
      days,
      budgetTier,
      interests,
    );

    // Call our robust retry wrapper. If it fails 3 times, it throws "AI_CAPACITY_ERROR"
    const aiData = await generateWithFallback(systemInstruction);

    // Bind the generated data to the logged-in user and initialize tracking arrays
    const trip = await Trip.create({
      user: req.user._id,
      destination,
      days,
      budgetTier,
      interests,
      itinerary: aiData.itinerary,
      hotelSuggestions: aiData.hotelSuggestions,
      estimatedBudget: aiData.estimatedBudget,
      actualExpenses: [],
    });

    res.status(201).json(trip);
  } catch (error) {
    // Intercept specific AI failures to show the user a nice modal instead of a generic crash
    if (error.message === "AI_CAPACITY_ERROR") {
      res.status(503); // 503 Service Unavailable is the proper HTTP code for capacity issues
      return next(new Error(error.message));
    }
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
    // Optimize performance by selecting only the fields needed for the dashboard cards
    const trips = await Trip.find({ user: req.user._id })
      .select("destination days budgetTier createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json(trips);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single trip by ID
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

    // Tenant Isolation Check: Prevent users from guessing IDs to view other people's trips
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

    const systemInstruction = getUpdateTripPrompt(
      destination,
      days,
      budgetTier,
      interests,
    );
    const aiData = await generateWithFallback(systemInstruction);

    // Save the current state to the version history BEFORE we overwrite it
    pushToHistory(trip, "Global Edit: Changed Trip Parameters");

    trip.destination = destination;
    trip.days = days;
    trip.budgetTier = budgetTier;
    trip.interests = interests;
    trip.itinerary = aiData.itinerary;
    trip.hotelSuggestions = aiData.hotelSuggestions;
    trip.estimatedBudget = aiData.estimatedBudget;
    // We intentionally leave actualExpenses untouched so real-world data isn't lost

    const updatedTrip = await trip.save();
    res.status(200).json(updatedTrip);
  } catch (error) {
    if (error.message === "AI_CAPACITY_ERROR") {
      res.status(503);
      return next(new Error(error.message));
    }
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

    // Push directly into the nested array
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

    // Filter out the activity matching the MongoDB Object ID
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
  const { userPrompt } = req.body;

  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized or trip not found");
    }

    const systemInstruction = getRegenerateDayPrompt(
      trip,
      dayNumber,
      userPrompt,
    );
    const aiData = await generateWithFallback(systemInstruction);

    // Save the snapshot so the user can undo this single-day AI edit if they hate it
    pushToHistory(trip, `AI Edit (Day ${dayNumber}): "${userPrompt}"`);

    const dayIndex = trip.itinerary.findIndex((d) => d.day === dayNumber);
    if (dayIndex !== -1) {
      trip.itinerary[dayIndex] = aiData;
    } else {
      trip.itinerary.push(aiData);
    }

    // Re-sort the array chronologically just in case the AI messed up the ordering
    trip.itinerary.sort((a, b) => a.day - b.day);

    await trip.save();
    res.status(200).json(trip);
  } catch (error) {
    if (error.message === "AI_CAPACITY_ERROR") {
      res.status(503);
      return next(new Error(error.message));
    }
    console.error("AI Day Regeneration Error:", error);
    res.status(500);
    next(new Error("Failed to regenerate day. Please try again."));
  }
};

/**
 * @desc    Add an actual expense to a trip
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
    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized or trip not found");
    }

    const targetVersion = trip.versionHistory.find(
      (v) => v.versionId === req.params.versionId,
    );
    if (!targetVersion) {
      res.status(404);
      throw new Error("Version not found");
    }

    // Creating a snapshot of the current state BEFORE we restore the old one.
    // This allows the user to "undo an undo".
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
    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized or trip not found");
    }

    // Pluck out the specific itinerary snapshots the user selected
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

    const systemInstruction = getMergeVersionsPrompt(
      trip,
      contexts,
      userPrompt,
    );
    const mergedItinerary = await generateWithFallback(systemInstruction);

    // Guardrail: Ensure prompt injection didn't successfully force the AI to alter trip length
    if (
      !Array.isArray(mergedItinerary) ||
      mergedItinerary.length !== trip.days
    ) {
      res.status(400);
      throw new Error("DAY_VIOLATION"); // Caught by the frontend warning modal
    }

    pushToHistory(trip, `AI Merge: ${userPrompt}`);

    trip.itinerary = mergedItinerary;
    await trip.save();

    res.status(200).json(trip);
  } catch (error) {
    if (
      error.message === "DAY_VIOLATION" ||
      error.message === "AI_CAPACITY_ERROR"
    ) {
      res.status(error.message === "DAY_VIOLATION" ? 400 : 503);
      return next(new Error(error.message));
    }
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
    trip.versionHistory = []; // Wipe history to commit the final version to "Base Truth"

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
