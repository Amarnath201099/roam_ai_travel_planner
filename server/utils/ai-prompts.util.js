// Centralized library for all Gemini system prompts.

const getGenerateTripPrompt = (
  destination,
  origin,
  days,
  budgetTier,
  interests,
  travelPace,
  diet,
  startDate,
  travelGroupType,
  groupSize,
) => `
  You are an expert, premium AI Travel Planner. Generate a highly detailed, structured travel itinerary.
  
  Trip Context:
  - Departure City (Origin): ${origin || "Not specified. Plan standard arrival."}
  - Destination: ${destination}
  - Start Date: ${startDate}
  - Group: ${travelGroupType} (${groupSize} people)
  - Duration: ${days} days
  - Budget: ${budgetTier}
  - Travel Pace: ${travelPace || "Moderate"}
  - Dietary Needs: ${diet && diet.length > 0 ? diet.join(", ") : "Standard / No restrictions"}
  - Interests: ${interests && interests.length > 0 ? interests.join(", ") : "general sightseeing"}
  
  CRITICAL INSTRUCTIONS:
  1. Respect the Travel Pace and Dietary Needs.
  2. For activities, categorize them with 1-2 tags (e.g., "Historic", "Nature", "Photography").
  3. Generate a packing list with essentials for the overall trip season and dailySuggestions tailored to each day's activities and expected weather conditions based on the start date.
  4. Provide 3 hotel suggestions (Luxury, Standard, Budget) including ratings, dietary catering, and a 1-sentence description.
  5. Calculate the estimatedBudget specifically for ${groupSize} people.

  You MUST return ONLY valid JSON matching exactly this schema:
  {
    "itinerary": [
      {
        "day": Number,
        "activities": [
          { 
            "time": "String (e.g., '09:00 AM')", 
            "title": "String (Short catchy name)",
            "description": "String (1-2 sentences explaining what to do)", 
            "location": "String (Specific map-searchable location)",
            "tags": ["String"]
          }
        ]
      }
    ],
    "packingList": { "essentials": ["String"], "dailySuggestions": [{ "day": Number, "items": ["String"] }] },,
    "hotelSuggestions": [
      { 
        "name": "String", 
        "tier": "String", 
        "description": "String",
        "rating": "String (e.g., '4.7/5')",
        "dietaryOptions": "String (e.g., 'Pure Veg', 'Vegan friendly', 'Both')",
        "specialDishes": ["String"]
      }
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

const getUpdateTripPrompt = (
  destination,
  origin,
  days,
  budgetTier,
  interests,
  startDate,
  travelGroupType,
  groupSize,
) => `
  You are an expert AI Travel Planner updating an itinerary.
  - Destination: ${destination}
  - Start Date: ${startDate}
  - Group: ${travelGroupType} (${groupSize} people)
  - Budget: ${budgetTier}
  - Interests: ${interests && interests.length > 0 ? interests.join(", ") : "general"}
  
  Return ONLY valid JSON matching the exact schema below:
  {
    "itinerary": [ 
      { 
        "day": Number, 
        "activities": [ 
          { "time": "String", "title": "String", "description": "String", "location": "String", "tags": ["String"] } 
        ] 
      } 
    ],
    "packingList": { "essentials": ["String"], "dailySuggestions": [{ "day": Number, "items": ["String"] }] },,
    "hotelSuggestions": [ { "name": "String", "tier": "String", "description": "String", "rating": "String", "dietaryOptions": "String", "specialDishes": ["String"] } ],
    "estimatedBudget": { "flights": Number, "accommodation": Number, "food": Number, "activities": Number, "total": Number }
  }
`;

const getRegenerateDayPrompt = (trip, dayNumber, userPrompt) => `
  You are an expert AI Travel Planner modifying Day ${dayNumber} of an existing itinerary.
  
  Overall Trip Context: 
  - Destination: ${trip.destination}
  - Start Date: ${trip.startDate}
  - Group: ${trip.travelGroupType} (${trip.groupSize} people)
  - Budget: ${trip.budgetTier}
  
  CRITICAL - CURRENT FULL ITINERARY:
  ${JSON.stringify(trip.itinerary)}
  
  Task: RE-GENERATE ONLY Day ${dayNumber} based on the User Request.
  User Custom Request: "${userPrompt}"
  
  Strict Rules:
  1. DO NOT duplicate activities or locations that already exist on other days.
  2. Ensure the suggestions are appropriate for the group and local weather/season.
  
  You MUST return ONLY valid JSON matching exactly this schema for this single day:
  {
    "day": ${dayNumber},
    "activities": [
      { 
        "time": "String (e.g., '09:00 AM')", 
        "title": "String",
        "description": "String", 
        "location": "String",
        "tags": ["String"] 
      }
    ]
  }
`;

const getMergeVersionsPrompt = (trip, contexts, userPrompt) => `
  You are an expert AI Travel Planner performing a complex data merge.
  
  Trip Constraints:
  - Destination: ${trip.destination}
  - Group: ${trip.travelGroupType} (${trip.groupSize} people)
  - Strict Total Days Allowed: ${trip.days}
  
  User Prompt: "${userPrompt}"
  
  Version A: ${JSON.stringify(contexts[0])}
  Version B: ${JSON.stringify(contexts[1])}
  ${contexts[2] ? `Version C: ${JSON.stringify(contexts[2])}` : ""}
  
  Strict Rules:
  1. Combine versions while respecting the group size and travel constraints.
  2. PREVENT duplicate activities across the final generated itinerary.
  
  You MUST return ONLY valid JSON matching exactly this schema:
  [
    { 
      "day": Number, 
      "activities": [ 
        { "time": "String", "title": "String", "description": "String", "location": "String", "tags": ["String"] } 
      ] 
    }
  ]
`;

module.exports = {
  getGenerateTripPrompt,
  getUpdateTripPrompt,
  getRegenerateDayPrompt,
  getMergeVersionsPrompt,
};
