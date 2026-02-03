/**
 * Performance Optimization Module
 * Implements caching, memoization, and optimization strategies
 * for the RAG chatbot system
 */

/**
 * Simple LRU (Least Recently Used) Cache
 */
class LRUCache {
    constructor(maxSize = 100) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }

    get(key) {
        if (!this.cache.has(key)) {
            return null;
        }
        
        // Move to end (most recently used)
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        
        return value;
    }

    set(key, value) {
        // Remove if exists (to update position)
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        
        // Remove oldest if at capacity
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, value);
    }

    has(key) {
        return this.cache.has(key);
    }

    clear() {
        this.cache.clear();
    }

    get size() {
        return this.cache.size;
    }
}

/**
 * Embedding Cache
 * Caches embeddings for frequently asked questions
 */
export const embeddingCache = new LRUCache(200);

/**
 * Search Results Cache
 * Caches search results to avoid redundant queries
 */
export const searchCache = new LRUCache(50);

/**
 * Response Cache
 * Caches complete responses for identical questions
 */
export const responseCache = new LRUCache(30);

/**
 * Generate cache key from query and options
 */
export function generateCacheKey(query, options = {}) {
    const normalizedQuery = query.toLowerCase().trim();
    const optionsStr = JSON.stringify(options);
    return `${normalizedQuery}:${optionsStr}`;
}

/**
 * Debounce function to limit API calls
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit execution rate
 */
export function throttle(func, limit = 1000) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Batch requests to reduce API calls
 */
class RequestBatcher {
    constructor(batchSize = 5, batchDelay = 100) {
        this.batchSize = batchSize;
        this.batchDelay = batchDelay;
        this.queue = [];
        this.timeout = null;
    }

    add(request) {
        return new Promise((resolve, reject) => {
            this.queue.push({ request, resolve, reject });
            
            if (this.queue.length >= this.batchSize) {
                this.flush();
            } else {
                this.scheduleBatch();
            }
        });
    }

    scheduleBatch() {
        if (this.timeout) return;
        
        this.timeout = setTimeout(() => {
            this.flush();
        }, this.batchDelay);
    }

    async flush() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }

        if (this.queue.length === 0) return;

        const batch = this.queue.splice(0, this.batchSize);
        
        // Process batch
        try {
            const results = await Promise.all(
                batch.map(item => item.request())
            );
            
            batch.forEach((item, index) => {
                item.resolve(results[index]);
            });
        } catch (error) {
            batch.forEach(item => {
                item.reject(error);
            });
        }
    }
}

export const embeddingBatcher = new RequestBatcher(5, 100);

/**
 * Lazy loading utility
 */
export function lazyLoad(importFunc) {
    let module = null;
    let promise = null;

    return async () => {
        if (module) return module;
        if (promise) return promise;

        promise = importFunc().then(m => {
            module = m;
            promise = null;
            return m;
        });

        return promise;
    };
}

/**
 * Memoize expensive functions
 */
export function memoize(fn, getKey = (...args) => JSON.stringify(args)) {
    const cache = new Map();

    return function memoized(...args) {
        const key = getKey(...args);
        
        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = fn.apply(this, args);
        cache.set(key, result);
        
        return result;
    };
}

/**
 * IndexedDB Cache for persistent storage
 */
export class IndexedDBCache {
    constructor(dbName = 'RAGChatCache', storeName = 'embeddings') {
        this.dbName = dbName;
        this.storeName = storeName;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
        });
    }

    async get(key) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async set(key, value) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(value, key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async delete(key) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clear() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

export const persistentCache = new IndexedDBCache();

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
    }

    start(label) {
        this.metrics.set(label, {
            startTime: performance.now(),
            endTime: null,
            duration: null
        });
    }

    end(label) {
        const metric = this.metrics.get(label);
        if (metric) {
            metric.endTime = performance.now();
            metric.duration = metric.endTime - metric.startTime;
        }
        return metric;
    }

    getMetric(label) {
        return this.metrics.get(label);
    }

    getAllMetrics() {
        const results = {};
        this.metrics.forEach((value, key) => {
            results[key] = value.duration;
        });
        return results;
    }

    clear() {
        this.metrics.clear();
    }
}

export const perfMonitor = new PerformanceMonitor();

/**
 * Preload critical resources
 */
export async function preloadCriticalData() {
    const promises = [];
    
    // Preload common embeddings from cache
    const commonQueries = [
        "What are your skills?",
        "Tell me about your projects",
        "What's your experience?",
        "How can I contact you?"
    ];

    // This would be implemented when the app loads
    console.log('Preloading critical data...', commonQueries);
    
    return Promise.all(promises);
}

/**
 * Optimize Firestore queries with pagination
 */
export function createPaginatedQuery(collection, pageSize = 20) {
    let lastDoc = null;

    return {
        async getNextPage(query) {
            let q = query.limit(pageSize);
            
            if (lastDoc) {
                q = q.startAfter(lastDoc);
            }

            const snapshot = await getDocs(q);
            
            if (snapshot.docs.length > 0) {
                lastDoc = snapshot.docs[snapshot.docs.length - 1];
            }

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },

        reset() {
            lastDoc = null;
        }
    };
}

/**
 * Image lazy loading helper
 */
export function setupLazyImages() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img.lazy').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

export default {
    embeddingCache,
    searchCache,
    responseCache,
    generateCacheKey,
    debounce,
    throttle,
    embeddingBatcher,
    lazyLoad,
    memoize,
    persistentCache,
    perfMonitor,
    preloadCriticalData,
    createPaginatedQuery,
    setupLazyImages
};
