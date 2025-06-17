import { GoogleGenerativeAI } from "@google/generative-ai";

// Get the API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Gemini API key is not set!");
}

// Initialize the model with correct name format
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export const generateAIResponse = async (prompt) => {
  if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY environment variable is not set.");
  }

  try {
    const result = await model.generateContent({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);

    // Try with simplified prompt if the main one fails
    try {
      const simplifiedResult = await model.generateContent({
        contents: [
          {
            parts: [
              {
                text: "You are David's portfolio assistant. " + prompt,
              },
            ],
          },
        ],
      });

      const retryResponse = await simplifiedResult.response;
      const text = retryResponse.text();

      if (!text) {
        throw new Error("Empty response from retry");
      }

      return text;
    } catch (retryError) {
      console.error("Retry failed:", retryError);
      return handleFallbackResponse();
    }
  }
};

function handleFallbackResponse() {
  return "I'm having trouble connecting to AI services right now. Let me help you with what I know locally instead.";
}
