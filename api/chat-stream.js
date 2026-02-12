// Vercel Serverless Function - RAG Chat with Streaming Support
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Parse parameters from GET or POST
  let message, context, retrievedDocs, language, useRAG;

  if (req.method === "GET") {
    // EventSource uses GET with query params
    message = req.query.message;
    language = req.query.language || "en";
    useRAG = req.query.useRAG === "true";

    try {
      context = req.query.context ? JSON.parse(req.query.context) : [];
      retrievedDocs = req.query.retrievedDocs ? JSON.parse(req.query.retrievedDocs) : [];
    } catch (e) {
      console.error("Failed to parse JSON params:", e);
      context = [];
      retrievedDocs = [];
    }
  } else {
    // POST request
    ({ message, context =[], retrievedDocs =[], language = "en", useRAG = true } = req.body);
  }

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // Build prompt - STRICT PERSONA
    const systemPrompt = language === "id"
      ? `Kamu adalah asisten AI profesional untuk David. Jawab hanya berdasarkan fakta yang ada di Knowledge Base. Jangan mengarang bebas (hallucinate). Gaya bicara: Profesional namun tetap ramah.`
      : `You are David's professional AI assistant. Answer STRICTLY based on the provided Knowledge Base. Do NOT hallucinate or invent facts. Tone: Professional yet approachable.`;

    let prompt = systemPrompt + "\n\n";

    if (useRAG && retrievedDocs.length > 0) {
      const contextText = retrievedDocs
        .map((doc, idx) => `[Source ${idx + 1}: ${doc.title}]\n${doc.content}`)
        .join("\n\n---\n\n");

      const ragInstructions = language === "id"
        ? `Gunakan informasi berikut sebagai SATU-SATUNYA sumber kebenaran. Jika tidak ada di sini, katakan: "Maaf, informasi tersebut tidak tersedia di data saya."`
        : `Use the following information as the SINGLE source of truth. If the answer is not here, state: "I'm sorry, that information is not currently in my database."`;

      prompt += `${ragInstructions}\n\n### KNOWLEDGE BASE (TRUTH SOURCE):\n${contextText}\n\n`;
    }

    if (context.length > 0) {
      const historyText = context
        .slice(-5)
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join("\n");

      prompt += `### CONVERSATION HISTORY:\n${historyText}\n\n`;
    }

    const questionLabel = language === "id" ? "PERTANYAAN" : "QUESTION";
    const answerLabel = language === "id" ? "JAWABAN" : "ANSWER";

    prompt += `### ${questionLabel}:\n${message}\n\n### ${answerLabel}:`;

    const instructions = language === "id"
      ? `\n\nPetunjuk:\n- Jawab dengan ramah dan informatif\n- Gunakan format markdown untuk struktur yang lebih baik\n- Jika menyebutkan proyek atau skill, sebutkan detail spesifik\n- Tetap singkat tapi lengkap (2-4 paragraf)`
      : `\n\nInstructions:\n- Answer in a friendly and informative way\n- Use markdown formatting for better structure\n- When mentioning projects or skills, include specific details\n- Keep it concise but complete (2-4 paragraphs)`;

    prompt += instructions;

    const startTime = Date.now();

    // Always use streaming for GET requests (EventSource)
    // For POST, check the stream parameter
    const shouldStream = req.method === "GET" || req.body?.stream;

    // Streaming mode
    if (shouldStream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const result = await model.generateContentStream(prompt);

      let fullText = '';
      for await (const chunk of result.stream) {
        const text = chunk.text();
        fullText += text;
        res.write(`data: ${JSON.stringify({ type: 'chunk', chunk: text })}\n\n`);
      }

      const responseTime = Date.now() - startTime;
      res.write(`data: ${JSON.stringify({
        type: 'done',
        fullText,
        responseTime,
        sources: retrievedDocs.map(doc => ({
          id: doc.id,
          title: doc.title,
          similarity: doc.similarity
        }))
      })}\n\n`);
      res.end();

    } else {
      // Non-streaming mode (existing)
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
    }

  } catch (error) {
    console.error("RAG Chat API Error:", error);

    const errorMessage = language === "id"
      ? "Maaf, terjadi kesalahan saat memproses permintaan Anda."
      : "Sorry, there was an error processing your request.";

    const shouldStream = req.method === "GET" || req.body?.stream;
    if (shouldStream) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
      res.end();
    } else {
      return res.status(500).json({
        error: error.message || errorMessage,
        response: errorMessage
      });
    }
  }
}
