import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Cache untuk mengurangi reads
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get all documents from a collection
 */
export const getCollection = async (collectionName, options = {}) => {
  const { useCache = true, orderByField = 'order', orderDirection = 'asc' } = options;
  
  const cacheKey = `${collectionName}-all`;
  
  // Check cache
  if (useCache && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }
  
  try {
    const colRef = collection(db, collectionName);
    let q = colRef;
    
    // Add ordering if specified
    if (orderByField) {
      q = query(colRef, orderBy(orderByField, orderDirection));
    }
    
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Cache the result
    cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
};

/**
 * Get a single document by ID
 */
export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching document ${docId}:`, error);
    return null;
  }
};

/**
 * Add a new document
 */
export const addDocument = async (collectionName, data) => {
  try {
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Invalidate cache
    invalidateCache(collectionName);
    
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error(`Error adding document:`, error);
    throw error;
  }
};

/**
 * Update a document
 */
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    // Invalidate cache
    invalidateCache(collectionName);
    
    return { id: docId, ...data };
  } catch (error) {
    console.error(`Error updating document:`, error);
    throw error;
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    
    // Invalidate cache
    invalidateCache(collectionName);
    
    return true;
  } catch (error) {
    console.error(`Error deleting document:`, error);
    throw error;
  }
};

/**
 * Set a document with specific ID (for singleton documents like profile, skills)
 */
export const setDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    // Invalidate cache
    invalidateCache(collectionName);
    
    return { id: docId, ...data };
  } catch (error) {
    console.error(`Error setting document:`, error);
    throw error;
  }
};

/**
 * Get published documents only
 */
export const getPublishedCollection = async (collectionName, options = {}) => {
  const { orderByField = 'order', orderDirection = 'asc' } = options;
  
  try {
    const colRef = collection(db, collectionName);
    const q = query(
      colRef, 
      where('isPublished', '==', true),
      orderBy(orderByField, orderDirection)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error fetching published ${collectionName}:`, error);
    return [];
  }
};

/**
 * Invalidate cache for a collection
 */
export const invalidateCache = (collectionName) => {
  const keysToDelete = [];
  cache.forEach((value, key) => {
    if (key.startsWith(collectionName)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => cache.delete(key));
};

/**
 * Clear all cache
 */
export const clearCache = () => {
  cache.clear();
};

/**
 * Batch update order for reordering
 */
export const updateOrder = async (collectionName, items) => {
  try {
    const promises = items.map((item, index) => {
      const docRef = doc(db, collectionName, item.id);
      return updateDoc(docRef, { order: index });
    });
    
    await Promise.all(promises);
    invalidateCache(collectionName);
    
    return true;
  } catch (error) {
    console.error(`Error updating order:`, error);
    throw error;
  }
};
