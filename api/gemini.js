import { GoogleGenerativeAI } from "@google/generative-ai";

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res
      .status(400)
      .json({ error: "Prompt is required in the request body." });
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res
      .status(500)
      .json({ error: "GEMINI_API_KEY environment variable is not set." });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ response: text });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res
      .status(500)
      .json({ error: "Failed to generate response from Gemini API." });
  }
};
