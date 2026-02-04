// Vercel Serverless Function - RAG-Enhanced Chat
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

  const {
    message,
    context = [], // Previous messages for conversation context
    retrievedDocs = [], // Documents from vector search (sent from client)
    language = "en",
    useRAG = true
  } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // API Key
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // Build enhanced prompt with RAG context
    let prompt = "";

    // System instructions - STRICT PERSONA
    const systemPrompt = language === "id"
      ? `Kamu adalah asisten AI profesional untuk David Gracia. Jawab hanya berdasarkan fakta yang ada di Knowledge Base. Jangan mengarang bebas (hallucinate). Gaya bicara: Profesional namun tetap ramah.`
      : `You are David Gracia's professional AI assistant. Answer STRICTLY based on the provided Knowledge Base. Do NOT hallucinate or invent facts. Tone: Professional yet approachable.`;

    // Add retrieved documents as context (if RAG enabled)
    if (useRAG && retrievedDocs.length > 0) {
      const contextText = retrievedDocs
        .map((doc, idx) => `[Source ${idx + 1}: ${doc.title}]\n${doc.content}`)
        .join("\n\n---\n\n");

      const ragInstructions = language === "id"
        ? `Gunakan informasi berikut sebagai SATU-SATUNYA sumber kebenaran. Jika tidak ada di sini, katakan: "Maaf, informasi tersebut tidak tersedia di data saya."`
        : `Use the following information as the SINGLE source of truth. If the answer is not here, state: "I'm sorry, that information is not currently in my database."`;

      prompt += `${systemPrompt}\n\n${ragInstructions}\n\n### KNOWLEDGE BASE (TRUTH SOURCE):\n${contextText}\n\n`;
    } else {
      prompt += `${systemPrompt}\n\n`;
    }

    // Add conversation history for context awareness
    if (context.length > 0) {
      const historyText = context
        .slice(-5) // Last 5 messages only
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join("\n");

      prompt += `### CONVERSATION HISTORY:\n${historyText}\n\n`;
    }

    // Add current question
    const questionLabel = language === "id" ? "PERTANYAAN" : "QUESTION";
    const answerLabel = language === "id" ? "JAWABAN" : "ANSWER";

    prompt += `### ${questionLabel}:\n${message}\n\n### ${answerLabel}:`;

    // Additional instructions
    const instructions = language === "id"
      ? `\n\nPetunjuk:\n- Jawab dengan ramah dan informatif\n- Gunakan format markdown untuk struktur yang lebih baik\n- Jika menyebutkan proyek atau skill, sebutkan detail spesifik\n- Tetap singkat tapi lengkap (2-4 paragraf)`
      : `\n\nInstructions:\n- Answer in a friendly and informative way\n- Use markdown formatting for better structure\n- When mentioning projects or skills, include specific details\n- Keep it concise but complete (2-4 paragraphs)`;

    prompt += instructions;

    // Generate response
    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseTime = Date.now() - startTime;

    return res.status(200).json({
      response: response.text(),
      responseTime,
      sources: retrievedDocs.map(doc => ({
        id: doc.id,
        title: doc.title,
        similarity: doc.similarity
      })),
      tokensUsed: result.response.usageMetadata || null
    });

  } catch (error) {
    console.error("RAG Chat API Error:", error);

    const errorMessage = language === "id"
      ? "Maaf, terjadi kesalahan saat memproses permintaan Anda."
      : "Sorry, there was an error processing your request.";

    return res.status(500).json({
      error: error.message || errorMessage,
      response: errorMessage
    });
  }
}
