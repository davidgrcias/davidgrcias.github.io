import { GoogleGenerativeAI } from "@google/generative-ai";

// Access API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the Gemini API only if key exists
let genAI = null;
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
} else {
  console.warn("VITE_GEMINI_API_KEY is not set - AI chatbot will be disabled");
}

export const generateAIResponse = async (prompt) => {
  // Check if API is available
  if (!genAI) {
    console.warn("Gemini API not initialized");
    return "I apologize, but I'm currently unable to access my AI capabilities because the API key is missing. Please contact the administrator.";
  }

  try {
    // Using 'gemini-flash-latest' which is a standard alias and likely has better free tier availability
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);

    // More specific error messages could be added here based on error.message
    if (error.message?.includes("API key")) {
      return "There seems to be an issue with the API key configuration.";
    }

    return `I apologize, but I'm having trouble connecting to the AI service right now. (Error: ${error.message})`;
  }
};
