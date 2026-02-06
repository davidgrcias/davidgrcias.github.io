// Vercel Serverless Function — AI Agent Endpoint
// Supports both streaming (SSE) and non-streaming modes
// Uses Gemini 2.0 Flash for maximum intelligence + speed
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Parse request
  let prompt, language, stream, retrievedDocs;

  if (req.method === "GET") {
    prompt = req.query.prompt;
    language = req.query.language || "en";
    stream = req.query.stream === "true";
    try {
      retrievedDocs = req.query.retrievedDocs ? JSON.parse(req.query.retrievedDocs) : [];
    } catch (e) {
      retrievedDocs = [];
    }
  } else {
    ({
      prompt,
      language = "en",
      stream = false,
      retrievedDocs = [],
    } = req.body);
  }

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "API key not configured on server" });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Model configuration
    const modelConfig = {
      generationConfig: {
        temperature: 0.8,        // Balanced creativity
        topP: 0.92,              // Nucleus sampling
        topK: 40,                // Diverse token selection
        maxOutputTokens: 4096,   // Generous response length
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
      ],
    };

    // Try models in order of preference
    const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-flash"];

    const startTime = Date.now();

    if (stream) {
      // ============================================
      // STREAMING MODE (SSE)
      // ============================================
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      let lastError = null;
      for (const modelName of modelNames) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName, ...modelConfig });
          const result = await model.generateContentStream(prompt);
          let fullText = "";

          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullText += text;
            res.write(`data: ${JSON.stringify({ type: "chunk", chunk: text })}\n\n`);
          }

          const responseTime = Date.now() - startTime;
          res.write(
            `data: ${JSON.stringify({
              type: "done",
              fullText,
              responseTime,
              model: modelName,
              sources: (retrievedDocs || []).map((doc) => ({
                id: doc.id,
                title: doc.title,
                similarity: doc.similarity,
              })),
            })}\n\n`
          );
          res.end();
          return; // Success — exit
        } catch (e) {
          console.warn(`Stream model ${modelName} failed: ${e.message}`);
          lastError = e;
          continue;
        }
      }
      // All models failed
      res.write(`data: ${JSON.stringify({ type: "error", error: lastError?.message || "All models failed" })}\n\n`);
      res.end();
    } else {
      // ============================================
      // NON-STREAMING MODE
      // ============================================
      let lastError = null;
      for (const modelName of modelNames) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName, ...modelConfig });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const responseTime = Date.now() - startTime;
          const text = response.text();

          return res.status(200).json({
            text,
            response: text,
            responseTime,
            model: modelName,
            sources: (retrievedDocs || []).map((doc) => ({
              id: doc.id,
              title: doc.title,
              similarity: doc.similarity,
            })),
            tokensUsed: result.response.usageMetadata || null,
          });
        } catch (e) {
          console.warn(`Model ${modelName} failed: ${e.message}`);
          lastError = e;
          continue;
        }
      }
      // All models failed
      throw lastError || new Error("All Gemini models failed");
    }
  } catch (error) {
    console.error("Agent API Error:", error);

    const errorMessage =
      language === "id"
        ? "Maaf, terjadi kesalahan saat memproses permintaan Anda."
        : "Sorry, there was an error processing your request.";

    if (stream) {
      res.write(`data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`);
      res.end();
    } else {
      return res.status(500).json({
        error: error.message || errorMessage,
        text: errorMessage,
        response: errorMessage,
      });
    }
  }
}
