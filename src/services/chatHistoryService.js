/**
 * Chat History Service
 * 
 * Manages chat conversation history in Firestore for portfolio visitors.
 * - Anonymous visitor identification via localStorage fingerprint
 * - Max 3 conversations per visitor (auto-deletes oldest)
 * - CRUD operations for conversations
 * - Auto-save after each AI response
 * 
 * Firestore collection: chat_conversations
 * Document structure: {
 *   visitorId: string,
 *   title: string,
 *   messages: [{ type: 'user'|'bot', content: string, timestamp: string }],
 *   persona: string,
 *   createdAt: Timestamp,
 *   updatedAt: Timestamp
 * }
 */

import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

const COLLECTION_NAME = 'chat_conversations';
const MAX_CONVERSATIONS = 3;
const VISITOR_ID_KEY = 'portfolio_visitor_id';
const TITLE_MAX_LENGTH = 40;

// ============================================================
// Visitor Identity (Anonymous Fingerprint)
// ============================================================

/**
 * Get or create a unique anonymous visitor ID stored in localStorage.
 * No auth required — purely for grouping conversations.
 */
export const getVisitorId = () => {
  try {
    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
      console.log('[chatHistoryService] 🆕 Generated new visitor ID:', visitorId);
    } else {
      console.log('[chatHistoryService] ♻️ Using existing visitor ID:', visitorId);
    }
    return visitorId;
  } catch (error) {
    // Fallback for environments without localStorage (SSR, privacy mode)
    console.warn('[chatHistoryService] ⚠️ localStorage not available, using fallback ID');
    return `visitor_fallback_${Date.now()}`;
  }
};

// ============================================================
// Title Generation
// ============================================================

/**
 * Generate a conversation title from the first user message.
 * Truncates intelligently at word boundaries.
 */
export const generateTitle = (firstMessage) => {
  if (!firstMessage || typeof firstMessage !== 'string') return 'New Chat';
  const cleaned = firstMessage.trim().replace(/\s+/g, ' ');
  if (cleaned.length <= TITLE_MAX_LENGTH) return cleaned;
  // Truncate at word boundary
  const truncated = cleaned.substring(0, TITLE_MAX_LENGTH);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 20 ? truncated.substring(0, lastSpace) : truncated) + '…';
};

// ============================================================
// CRUD Operations
// ============================================================

/**
 * Fetch all conversations for the current visitor, sorted by most recent.
 * Returns array of conversation objects with Firestore doc IDs.
 */
export const getConversations = async () => {
  const visitorId = getVisitorId();

  try {
    // Simple query — only filter by visitorId, sort client-side
    // This avoids needing a Firestore composite index
    const q = query(
      collection(db, COLLECTION_NAME),
      where('visitorId', '==', visitorId)
    );

    const snapshot = await getDocs(q);
    
    const conversations = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
      updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date(),
    }));

    // Sort client-side: newest first, then limit to MAX
    conversations.sort((a, b) => b.updatedAt - a.updatedAt);
    return conversations.slice(0, MAX_CONVERSATIONS);
  } catch (error) {
    console.error('[chatHistoryService] Error fetching conversations:', error.message);
    return [];
  }
};

/**
 * Create a new conversation. If the visitor already has MAX_CONVERSATIONS,
 * the oldest one is automatically deleted first.
 * 
 * @param {Object} params
 * @param {Array} params.messages - Initial message array
 * @param {string} params.persona - Active persona ID
 * @returns {Object} The created conversation with its Firestore ID
 */
export const createConversation = async ({ messages = [], persona = 'assistant' }) => {
  const visitorId = getVisitorId();

  try {
    await enforceConversationLimit(visitorId);

    const firstUserMsg = messages.find((m) => m.type === 'user');
    const title = generateTitle(firstUserMsg?.content);
    const serializedMessages = serializeMessages(messages);

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      visitorId,
      title,
      messages: serializedMessages,
      persona,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      visitorId,
      title,
      messages: serializedMessages,
      persona,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('[chatHistoryService] Error creating conversation:', error.message);
    throw error;
  }
};

/**
 * Update an existing conversation (append messages, update title, etc.).
 * 
 * @param {string} conversationId - Firestore document ID
 * @param {Object} updates - Fields to update (messages, title, persona)
 */
export const updateConversation = async (conversationId, updates) => {
  if (!conversationId) return null;

  try {
    const docRef = doc(db, COLLECTION_NAME, conversationId);
    const updateData = { updatedAt: serverTimestamp() };

    if (updates.messages) {
      updateData.messages = serializeMessages(updates.messages);
    }
    if (updates.title) {
      updateData.title = updates.title;
    }
    if (updates.persona) {
      updateData.persona = updates.persona;
    }

    await updateDoc(docRef, updateData);
    return { id: conversationId, ...updates };
  } catch (error) {
    console.error('[ChatHistory] Error updating conversation:', error);
    return null;
  }
};

/**
 * Delete a specific conversation.
 */
export const deleteConversation = async (conversationId) => {
  if (!conversationId) return false;

  try {
    await deleteDoc(doc(db, COLLECTION_NAME, conversationId));
    return true;
  } catch (error) {
    console.error('[ChatHistory] Error deleting conversation:', error);
    return false;
  }
};

// ============================================================
// Helpers
// ============================================================

/**
 * Enforce the MAX_CONVERSATIONS limit by deleting the oldest conversation(s).
 */
const enforceConversationLimit = async (visitorId) => {
  try {
    // Simple query — no orderBy, sort client-side to avoid composite index
    const q = query(
      collection(db, COLLECTION_NAME),
      where('visitorId', '==', visitorId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.size >= MAX_CONVERSATIONS) {
      // Sort docs by updatedAt descending, then delete the oldest
      const sorted = [...snapshot.docs].sort((a, b) => {
        const aTime = a.data().updatedAt?.toDate?.()?.getTime() || 0;
        const bTime = b.data().updatedAt?.toDate?.()?.getTime() || 0;
        return bTime - aTime;
      });
      const docsToDelete = sorted.slice(MAX_CONVERSATIONS - 1);
      await Promise.all(docsToDelete.map((d) => deleteDoc(d.ref)));
    }
  } catch (error) {
    console.error('[ChatHistory] Error enforcing limit:', error.message);
  }
};

/**
 * Serialize messages array for Firestore storage.
 * Converts Date objects to ISO strings and strips React components.
 */
const serializeMessages = (messages) => {
  return messages.map((msg) => ({
    type: msg.type || 'bot',
    content: typeof msg.content === 'string' ? msg.content : String(msg.content || ''),
    timestamp: msg.timestamp instanceof Date
      ? msg.timestamp.toISOString()
      : typeof msg.timestamp === 'string'
        ? msg.timestamp
        : new Date().toISOString(),
  }));
};

/**
 * Deserialize messages from Firestore into the format ChatBot expects.
 */
export const deserializeMessages = (messages) => {
  if (!Array.isArray(messages)) return [];
  return messages.map((msg) => ({
    type: msg.type || 'bot',
    content: msg.content || '',
    timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
  }));
};
