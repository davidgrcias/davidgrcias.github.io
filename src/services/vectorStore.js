// Vector Store Service - Handles embeddings and similarity search
import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { embeddingCache, searchCache, generateCacheKey, perfMonitor } from '../utils/performance';

// Cosine similarity calculation
export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Simple hash-based embedding fallback for development
const createSimpleEmbedding = (text) => {
  const embedding = new Array(768).fill(0);
  for (let i = 0; i < text.length && i < 768; i++) {
    embedding[i] = text.charCodeAt(i) / 255;
  }
  // Add some randomness based on text length
  for (let i = 0; i < 768; i++) {
    embedding[i] += Math.sin(text.length * i) * 0.1;
  }
  return embedding;
};

// Generate embedding using Gemini API
export const generateEmbedding = async (text) => {
  try {
    // Check cache first
    const cacheKey = generateCacheKey(text, { type: 'embedding' });
    const cached = embeddingCache.get(cacheKey);

    if (cached) {
      console.log('Embedding cache hit:', text.substring(0, 50));
      return cached;
    }

    perfMonitor.start('embedding-generation');

    // Try Vercel API first
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        mode: 'cors'
      });

      if (response.ok) {
        const data = await response.json();
        perfMonitor.end('embedding-generation');
        embeddingCache.set(cacheKey, data.embedding);
        return data.embedding;
      }
    } catch (apiError) {
      console.warn('API failed, using fallback embedding:', apiError.message);
    }

    // Fallback to simple embedding for development
    console.log('⚠️ Using fallback embedding (development mode)');
    const fallbackEmbedding = createSimpleEmbedding(text);
    perfMonitor.end('embedding-generation');
    embeddingCache.set(cacheKey, fallbackEmbedding);
    return fallbackEmbedding;

  } catch (error) {
    console.error('Error generating embedding:', error);
    // Last resort: return simple embedding
    return createSimpleEmbedding(text);
  }
};

// Store knowledge with embeddings in Firestore
export const storeKnowledge = async (knowledgeData) => {
  try {
    const { title, content, category, tags, language, type } = knowledgeData;

    // Generate embedding for the content
    const embedding = await generateEmbedding(`${title}\n${content}`);

    // Sanitize data to remove undefined values (Firestore doesn't like them)
    // IMPORTANT: Check arrays for undefined elements too!
    const cleanTags = (tags || []).filter(tag => tag !== undefined && tag !== null && tag !== '');

    const sanitizedData = {
      title: title || 'Untitled',
      content: content || '',
      type: type || 'portfolio',
      category: category || 'other',
      metadata: {
        tags: cleanTags,
        language: language || 'en',
        author: 'David Gracia'
      },
      embedding: embedding || [], // Ensure embedding is not undefined
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Check for duplicates
    const q = query(
      collection(db, 'knowledge_base'),
      where('title', '==', sanitizedData.title),
      where('metadata.language', '==', sanitizedData.metadata.language)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      console.log(`Skipping duplicate content: ${title}`);
      return { id: snapshot.docs[0].id, success: true, skipped: true };
    }

    // Store in Firestore
    const docRef = await addDoc(collection(db, 'knowledge_base'), sanitizedData);

    return { id: docRef.id, success: true };
  } catch (error) {
    console.error('Error storing knowledge:', error);
    throw error;
  }
};

// Update existing knowledge
export const updateKnowledge = async (id, updates) => {
  try {
    const docRef = doc(db, 'knowledge_base', id);

    // If content changed, regenerate embedding
    if (updates.content || updates.title) {
      const title = updates.title || '';
      const content = updates.content || '';
      updates.embedding = await generateEmbedding(`${title}\n${content}`);
    }

    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating knowledge:', error);
    throw error;
  }
};

// Delete knowledge
export const deleteKnowledge = async (id) => {
  try {
    await deleteDoc(doc(db, 'knowledge_base', id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting knowledge:', error);
    throw error;
  }
};

// Search for similar knowledge using vector similarity
export const searchSimilarKnowledge = async (queryText, options = {}) => {
  try {
    const {
      topK = 5,
      language = null,
      category = null,
      threshold = 0.3,
      includeInactive = false
    } = options;

    // Check cache first
    const cacheKey = generateCacheKey(queryText, { topK, language, category, threshold });
    const cached = searchCache.get(cacheKey);

    if (cached) {
      console.log('Search cache hit:', queryText.substring(0, 50));
      return cached;
    }

    perfMonitor.start('vector-search');

    // Generate embedding for the query (with fallback)
    let queryEmbedding;
    try {
      queryEmbedding = await generateEmbedding(queryText);
    } catch (error) {
      console.error('Failed to generate query embedding:', error);
      // Return empty results if embedding fails
      return [];
    }

    // Get all knowledge entries from Firestore
    let q = query(collection(db, 'knowledge_base'));

    // Apply filters
    if (!includeInactive) {
      q = query(q, where('isActive', '==', true));
    }
    if (language) {
      q = query(q, where('metadata.language', '==', language));
    }
    if (category) {
      q = query(q, where('category', '==', category));
    }

    const snapshot = await getDocs(q);

    // Calculate similarity for each document
    const results = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.embedding) {
        const similarity = cosineSimilarity(queryEmbedding, data.embedding);

        if (similarity >= threshold) {
          results.push({
            id: doc.id,
            ...data,
            similarity,
            // Remove embedding from result to reduce payload
            embedding: undefined
          });
        }
      }
    });

    // Sort by similarity (highest first) and return top K
    const finalResults = results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    perfMonitor.end('vector-search');

    // Cache the results
    searchCache.set(cacheKey, finalResults);

    return finalResults;

  } catch (error) {
    console.error('Error searching knowledge:', error);
    throw error;
  }
};

// Get all knowledge (for admin panel)
export const getAllKnowledge = async (filters = {}) => {
  try {
    let q = query(collection(db, 'knowledge_base'));

    if (filters.language) {
      q = query(q, where('metadata.language', '==', filters.language));
    }
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    if (filters.type) {
      q = query(q, where('type', '==', filters.type));
    }

    const snapshot = await getDocs(q);
    const knowledge = [];

    snapshot.forEach((doc) => {
      knowledge.push({
        id: doc.id,
        ...doc.data(),
        // Remove embedding to reduce payload
        embedding: undefined
      });
    });

    return knowledge;
  } catch (error) {
    console.error('Error getting all knowledge:', error);
    throw error;
  }
};

// Batch import knowledge
export const batchImportKnowledge = async (knowledgeArray) => {
  const results = {
    success: [],
    failed: []
  };

  for (const item of knowledgeArray) {
    try {
      // Add small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = await storeKnowledge(item);
      results.success.push({ ...item, id: result.id });
    } catch (error) {
      console.error(`Failed to import "${item.title}":`, error);
      results.failed.push({ ...item, error: error.message });
    }
  }

  return results;
};
