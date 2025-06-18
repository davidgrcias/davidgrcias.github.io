import { GoogleGenerativeAI } from "@google/generative-ai";

// Access API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY is not set in environment variables");
}

// Initialize the Gemini API with the correct model name
const genAI = new GoogleGenerativeAI(API_KEY);

export const generateAIResponse = async (prompt) => {
  try {
    // Using a newer model to bypass potential SDK endpoint issues
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    // Call the model with the content in text format
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "I apologize, but I'm having trouble connecting to the AI service right now. Please try again in a moment.";
  }
};
