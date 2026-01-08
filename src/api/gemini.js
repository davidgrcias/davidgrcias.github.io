// API Client - Calls Vercel Serverless Function (Secure Proxy)

// Production: Use Vercel serverless function
// Development: Use local .env key fallback
const getApiUrl = () => {
  // In production (GitHub Pages), always call Vercel API
  if (import.meta.env.PROD) {
    return "https://davidgrcias-github-io-davidgrcias-projects-cc8794a2.vercel.app/api/chat";
  }
  // In development, use VITE_API_URL if set, otherwise fallback to direct call
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return null; // Will trigger local fallback
};

// Fallback: Direct Gemini call (for local development only)
const callGeminiDirectly = async (prompt) => {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  if (!API_KEY) {
    throw new Error("API key not configured");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const generateAIResponse = async (prompt) => {
  const apiUrl = getApiUrl();

  // If no API URL configured, fallback to direct call (local dev)
  if (!apiUrl) {
    try {
      return await callGeminiDirectly(prompt);
    } catch (error) {
      console.error("Direct Gemini call failed:", error);
      if (error.message?.includes("API key")) {
        return "There seems to be an issue with the API key configuration.";
      }
      return `I'm having trouble connecting. (Error: ${error.message})`;
    }
  }

  // Production: Call serverless function
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed (${response.status})`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error calling API:", error);
    return `I'm having trouble connecting to the AI service. (Error: ${error.message})`;
  }
};

