/**
 * AI Agent Core Service
 * 
 * The central orchestrator that ties together:
 * - Prompt Builder (system prompt assembly)
 * - Memory Manager (conversation context)
 * - Action System (UI actions)
 * - RAG Search (knowledge retrieval)
 * - Gemini API (LLM calls)
 * 
 * This is the main entry point for all AI interactions.
 */

import { assembleAgentPrompt, assembleWidgetPrompt } from './agentPromptBuilder';
import { parseAgentActions, executeAgentActions, suggestActions } from './agentActions';
import { getAgentMemory, resetAgentMemory } from './agentMemory';
import { searchSimilarKnowledge } from './vectorStore';
import { hybridSearch } from './hybridSearch';
import { logChatAnalytics, saveChatSession, updateChatFeedback } from './chatAnalytics';

// ============================================================
// DATA LOADERS — Fetch portfolio data with graceful fallbacks
// ============================================================

async function loadPortfolioData(language = 'en') {
  const loaders = {
    profile: () => import('../data/userProfile').then(m => m.getUserProfile(language)),
    projects: () => import('../data/projects').then(m => m.getProjects(language)),
    skills: () => import('../data/skills').then(m => m.getSkills(language)),
    experiences: () => import('../data/experiences').then(m => m.getExperiences(language)),
    education: () => import('../data/education').then(m => m.getEducation(language)),
    certifications: () => import('../data/certifications').then(m => m.getCertifications(language)),
    funFacts: () => import('../data/funFacts').then(m => m.getFunFacts(language)),
    insights: () => import('../data/insights').then(m => m.getInsights(language)),
  };

  const results = {};
  const entries = Object.entries(loaders);

  // Load all in parallel with individual error handling
  const settled = await Promise.allSettled(
    entries.map(async ([key, loader]) => {
      try {
        const data = await loader();
        return { key, data };
      } catch (error) {
        console.warn(`Failed to load ${key}:`, error);
        return { key, data: null };
      }
    })
  );

  settled.forEach(result => {
    if (result.status === 'fulfilled' && result.value) {
      results[result.value.key] = result.value.data;
    }
  });

  return results;
}

// Portfolio data cache
let _portfolioCache = null;
let _portfolioCacheTime = 0;
const PORTFOLIO_CACHE_TTL = 5 * 60 * 1000; // 5 min

async function getPortfolioData(language = 'en') {
  if (_portfolioCache && (Date.now() - _portfolioCacheTime < PORTFOLIO_CACHE_TTL)) {
    return _portfolioCache;
  }
  _portfolioCache = await loadPortfolioData(language);
  _portfolioCacheTime = Date.now();
  return _portfolioCache;
}

// ============================================================
// RAG SEARCH — Smart knowledge retrieval
// ============================================================

async function searchKnowledge(query, options = {}) {
  const {
    language = 'en',
    useHybrid = true,
    topK = 5,
    threshold = 0.2,
  } = options;

  try {
    let results;
    if (useHybrid) {
      results = await hybridSearch(query, {
        topK,
        language,
        threshold,
        vectorWeight: 0.6,
        keywordWeight: 0.4,
      });
    } else {
      results = await searchSimilarKnowledge(query, {
        topK,
        language,
        threshold,
      });
    }
    return results;
  } catch (error) {
    console.error('Knowledge search failed:', error);
    return [];
  }
}

// ============================================================
// API CALLERS — Call Gemini via Vercel serverless functions
// ============================================================

const VERCEL_PROD_URL = 'https://davidgrcias-github-io-davidgrcias-projects-cc8794a2.vercel.app';

function getApiBaseUrl() {
  // Check explicit base URL first (both prod & dev)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // Check VITE_API_URL and extract base (strip /api/chat suffix)
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL;
    const apiIndex = url.indexOf('/api/');
    return apiIndex !== -1 ? url.substring(0, apiIndex) : url;
  }
  // Always use Vercel production URL — never localhost
  return VERCEL_PROD_URL;
}

/**
 * Call the agent API endpoint (non-streaming)
 */
async function callAgentAPI(prompt, options = {}) {
  const { language = 'en', retrievedDocs = [] } = options;
  const apiUrl = `${getApiBaseUrl()}/api/chat-agent`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        language,
        retrievedDocs: retrievedDocs.map(doc => ({
          id: doc.id,
          title: doc.title,
          content: doc.content,
          similarity: doc.similarity,
        })),
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(`API ${response.status}: ${errBody.slice(0, 200)}`);
    }

    const data = await response.json();
    return data.text || data.response || '';
  } catch (error) {
    console.warn('Agent API call failed, trying client-side Gemini fallback:', error.message);
    try {
      return await callGeminiFallback(prompt);
    } catch (fallbackError) {
      console.error('Both API and fallback failed:', fallbackError.message);
      throw fallbackError;
    }
  }
}

/**
 * Call the agent API with streaming (SSE)
 */
function callAgentStreamAPI(prompt, options = {}) {
  const { language = 'en', retrievedDocs = [], onChunk, onDone, onError } = options;
  const apiUrl = `${getApiBaseUrl()}/api/chat-agent`;

  const streamUrl = new URL(apiUrl);
  streamUrl.searchParams.set('stream', 'true');
  streamUrl.searchParams.set('language', language);

  // For streaming, we POST to get the prompt across
  // But since EventSource only supports GET, we'll use fetch with ReadableStream
  const controller = new AbortController();

  fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      language,
      stream: true,
      retrievedDocs: retrievedDocs.map(doc => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        similarity: doc.similarity,
      })),
    }),
    signal: controller.signal,
  }).then(async response => {
    if (!response.ok) throw new Error(`Stream API failed: ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'chunk') {
              fullText += data.chunk;
              onChunk?.(data.chunk, fullText);
            } else if (data.type === 'done') {
              onDone?.(data.fullText || fullText, data.sources || []);
            } else if (data.type === 'error') {
              onError?.(new Error(data.error));
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    }

    // If stream ended without 'done' event
    if (fullText && !buffer.includes('"type":"done"')) {
      onDone?.(fullText, []);
    }
  }).catch(error => {
    if (error.name !== 'AbortError') {
      console.error('Stream error:', error);
      onError?.(error);
    }
  });

  // Return abort function
  return () => controller.abort();
}

/**
 * Direct Gemini fallback (client-side, for development)
 */
async function callGeminiFallback(prompt) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!API_KEY) throw new Error('No Gemini API key configured (VITE_GEMINI_API_KEY)');

  const genAI = new GoogleGenerativeAI(API_KEY);

  // Try multiple model names for compatibility
  const modelNames = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-flash'];
  let lastError = null;

  for (const modelName of modelNames) {
    try {
      console.log(`🤖 Trying Gemini model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      console.log(`✅ Success with model: ${modelName}`);
      return result.response.text();
    } catch (error) {
      console.warn(`❌ Model ${modelName} failed:`, error.message);
      lastError = error;
      // If it's not a model/key issue, don't try other models
      if (!error.message?.includes('not found') && 
          !error.message?.includes('not supported') &&
          !error.message?.includes('API key') &&
          !error.message?.includes('expired')) {
        throw error;
      }
    }
  }

  console.error('All Gemini model fallbacks failed');
  throw lastError;
}

// ============================================================
// MAIN AGENT INTERFACE
// ============================================================

/**
 * Send a message to the AI Agent (full featured, for MessengerApp)
 * 
 * This is the main entry point for the Messenger chatbot.
 * Handles: RAG search → Prompt assembly → API call → Action parsing → Memory update
 */
export async function sendAgentMessage(userMessage, options = {}) {
  const {
    language = 'en',
    useRAG = true,
    useHybrid = true,
    streaming = false,
    onChunk = null,
    onDone = null,
    onError = null,
    onActionExecuted = null,
  } = options;

  const memory = getAgentMemory();
  const startTime = Date.now();

  // 1. Add user message to memory
  memory.addMessage('user', userMessage);

  try {
    // 2. Load portfolio data
    const portfolioData = await getPortfolioData(language);

    // 3. Search knowledge base (RAG)
    let retrievedDocs = [];
    if (useRAG) {
      retrievedDocs = await searchKnowledge(userMessage, {
        language: memory.userProfile.language || language,
        useHybrid,
        topK: 6,
        threshold: 0.15,
      });
    }

    // 4. Get memory context
    const memoryContext = memory.getMemoryContext();

    // 5. Assemble the mega prompt
    const prompt = assembleAgentPrompt({
      userMessage,
      portfolioData,
      retrievedDocs,
      conversationHistory: memory.getRecentMessages(10),
      memoryContext,
      currentLanguage: memoryContext.userProfile?.language || language,
    });

    // 6. Call the API
    let rawResponse = '';

    if (streaming && onChunk) {
      // Streaming mode
      return new Promise((resolve, reject) => {
        const abort = callAgentStreamAPI(prompt, {
          language,
          retrievedDocs,
          onChunk: (chunk, fullText) => {
            onChunk(chunk, fullText);
          },
          onDone: async (fullText, sources) => {
            rawResponse = fullText;
            const result = await finalizeAgentResponse(rawResponse, {
              memory, retrievedDocs, startTime, language, userMessage,
              onActionExecuted,
            });
            onDone?.(result);
            resolve(result);
          },
          onError: (error) => {
            onError?.(error);
            reject(error);
          },
        });

        // Store abort function for cleanup
        return abort;
      });
    } else {
      // Non-streaming mode
      rawResponse = await callAgentAPI(prompt, { language, retrievedDocs });
      return await finalizeAgentResponse(rawResponse, {
        memory, retrievedDocs, startTime, language, userMessage,
        onActionExecuted,
      });
    }
  } catch (error) {
    console.error('Agent error:', error);

    const errorMessage = language === 'id'
      ? 'Maaf, terjadi kesalahan. Silakan coba lagi! 🙏'
      : "I'm having a bit of trouble right now! 🧠 Please try again in a moment.";

    memory.addMessage('bot', errorMessage, { isError: true });

    return {
      text: errorMessage,
      actions: [],
      sources: [],
      suggestions: memory.getSuggestedQuestions(),
      isError: true,
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * Process raw AI response: parse actions, update memory, log analytics
 */
async function finalizeAgentResponse(rawResponse, context) {
  const { memory, retrievedDocs, startTime, language, userMessage, onActionExecuted } = context;

  // 1. Parse actions from response
  const { cleanText, actions } = parseAgentActions(rawResponse);

  // 2. Add bot response to memory
  memory.addMessage('bot', cleanText, {
    hasActions: actions.length > 0,
    sourceCount: retrievedDocs.length,
  });

  // 3. Execute actions (non-blocking)
  if (actions.length > 0) {
    executeAgentActions(actions, {
      delay: 500,
      onActionExecuted: onActionExecuted || null,
    }).catch(err => console.warn('Action execution error:', err));
  }

  // 4. Get smart suggestions
  const suggestions = memory.getSuggestedQuestions();

  // 5. Get action suggestions from context
  const actionSuggestions = suggestActions(userMessage, cleanText);

  // 6. Calculate response time
  const responseTime = Date.now() - startTime;

  // 7. Log analytics (non-blocking)
  logChatAnalytics({
    sessionId: memory.sessionId,
    question: userMessage,
    answer: cleanText,
    retrievedDocs: retrievedDocs.map(d => d.id),
    responseTime,
    language: memory.userProfile.language || language,
  }).catch(err => console.warn('Analytics log error:', err));

  // 8. Save session (non-blocking)
  saveChatSession(memory.sessionId, memory.getRecentMessages(20), {
    language: memory.userProfile.language || language,
    userProfile: memory.userProfile,
  }).catch(err => console.warn('Session save error:', err));

  return {
    text: cleanText,
    actions,
    actionSuggestions,
    sources: retrievedDocs.map(d => ({
      id: d.id,
      title: d.title,
      similarity: d.similarity,
      category: d.category,
    })),
    suggestions,
    responseTime,
    memoryStats: memory.getStats(),
    isError: false,
  };
}

// ============================================================
// WIDGET INTERFACE — Lighter version for ChatBot.jsx
// ============================================================

/**
 * Send a message via the floating widget (ChatBot.jsx)
 * Uses a lighter prompt without full RAG search
 */
export async function sendWidgetMessage(userMessage, options = {}) {
  const {
    language = 'en',
    conversationHistory = [],
    onActionExecuted = null,
  } = options;

  const startTime = Date.now();

  try {
    // 1. Load portfolio data
    const portfolioData = await getPortfolioData(language);

    // 2. Build widget prompt (lighter, no RAG)
    const prompt = assembleWidgetPrompt({
      userMessage,
      portfolioData,
      conversationHistory,
      currentLanguage: language,
    });

    // 3. Call API
    const rawResponse = await callAgentAPI(prompt, { language });

    // 4. Parse actions
    const { cleanText, actions } = parseAgentActions(rawResponse);

    // 5. Execute actions
    if (actions.length > 0) {
      executeAgentActions(actions, {
        delay: 500,
        onActionExecuted,
      }).catch(err => console.warn('Widget action error:', err));
    }

    return {
      text: cleanText,
      actions,
      responseTime: Date.now() - startTime,
      isError: false,
    };
  } catch (error) {
    console.error('Widget agent error:', error);
    return {
      text: language === 'id'
        ? 'Maaf, terjadi kesalahan. Coba lagi ya! 🙏'
        : "I'm having trouble connecting right now! Please try again. 🧠",
      actions: [],
      responseTime: Date.now() - startTime,
      isError: true,
    };
  }
}

// ============================================================
// UTILITY EXPORTS
// ============================================================

export { getAgentMemory, resetAgentMemory };

export function getAgentStats() {
  const memory = getAgentMemory();
  return memory.getStats();
}

export function clearPortfolioCache() {
  _portfolioCache = null;
  _portfolioCacheTime = 0;
}

export default {
  sendAgentMessage,
  sendWidgetMessage,
  getAgentMemory,
  resetAgentMemory,
  getAgentStats,
  clearPortfolioCache,
};
