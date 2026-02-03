// Vercel Serverless Function - Generate Embeddings using Gemini
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  // API Key from environment
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Use embedding model
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    
    const result = await model.embedContent(text);
    const embedding = result.embedding;

    return res.status(200).json({ 
      embedding: embedding.values,
      dimensions: embedding.values.length 
    });
    
  } catch (error) {
    console.error("Embedding API Error:", error);
    
    // Fallback: If embedding model not available, use simpler approach
    // Create a basic hash-based embedding (not ideal but works)
    if (error.message?.includes('not found') || error.message?.includes('embedding')) {
      const simpleEmbedding = createSimpleEmbedding(text);
      return res.status(200).json({ 
        embedding: simpleEmbedding,
        dimensions: simpleEmbedding.length,
        fallback: true
      });
    }
    
    return res.status(500).json({ 
      error: error.message || "Embedding generation failed" 
    });
  }
}

// Fallback: Simple embedding based on character frequencies
// This is NOT as good as real embeddings but works in a pinch
function createSimpleEmbedding(text, dimensions = 256) {
  const embedding = new Array(dimensions).fill(0);
  const normalized = text.toLowerCase().trim();
  
  // Character frequency based embedding
  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    const index = charCode % dimensions;
    embedding[index] += 1;
  }
  
  // Word-based features
  const words = normalized.split(/\s+/);
  words.forEach((word, idx) => {
    const wordHash = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = wordHash % dimensions;
    embedding[index] += 2;
  });
  
  // Normalize to unit vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
}
