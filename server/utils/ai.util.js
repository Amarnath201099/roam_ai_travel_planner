const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateWithFallback = async (systemInstruction) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const attemptGeneration = async (modelName) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: "application/json" },
    });
    const result = await model.generateContent(systemInstruction);
    return JSON.parse(result.response.text());
  };

  try {
    // Attempt 1: Standard 2.5 Flash
    return await attemptGeneration("gemini-2.5-flash");
  } catch (error1) {
    console.warn("Attempt 1 failed:", error1.message);
    await delay(1500); // Wait 1.5 seconds before retrying

    try {
      // Attempt 2: Standard 2.5 Flash again
      return await attemptGeneration("gemini-2.5-flash");
    } catch (error2) {
      console.warn("Attempt 2 failed:", error2.message);
      await delay(1500);

      try {
        // Attempt 3: Fallback to Flash Lite
        return await attemptGeneration("gemini-2.0-flash-lite");
      } catch (error3) {
        console.error("All AI attempts failed:", error3.message);
        // Throw a specific error code we can parse on the frontend
        throw new Error("AI_CAPACITY_ERROR");
      }
    }
  }
};

module.exports = { generateWithFallback };
