/**
 * Hybrid Search Module
 * Combines vector similarity search with keyword-based (BM25-like) search
 * for more accurate and comprehensive results
 */

import { searchSimilarKnowledge } from './vectorStore';
import { db } from '../config/firebase';
import { collection, getDocs, query as firestoreQuery, where } from 'firebase/firestore';

/**
 * Calculate BM25-like score for keyword matching
 * @param {string} queryText - Search query
 * @param {string} documentText - Document content
 * @param {Object} options - BM25 parameters
 * @returns {number} BM25 score
 */
function calculateBM25Score(queryText, documentText, options = {}) {
    const {
        k1 = 1.5,  // Term frequency saturation parameter
        b = 0.75,  // Length normalization parameter
        avgDocLength = 500  // Average document length (characters)
    } = options;

    const queryTerms = tokenize(queryText.toLowerCase());
    const docTerms = tokenize(documentText.toLowerCase());
    const docLength = documentText.length;

    let score = 0;

    queryTerms.forEach(term => {
        // Term frequency in document
        const tf = docTerms.filter(t => t === term).length;
        
        if (tf > 0) {
            // IDF approximation (simplified without corpus statistics)
            const idf = Math.log(1 + (1 / (tf + 1)));
            
            // BM25 formula
            const numerator = tf * (k1 + 1);
            const denominator = tf + k1 * (1 - b + b * (docLength / avgDocLength));
            
            score += idf * (numerator / denominator);
        }
    });

    return score;
}

/**
 * Simple tokenizer that splits text into words
 * @param {string} text - Text to tokenize
 * @returns {Array<string>} Array of tokens
 */
function tokenize(text) {
    return text
        .replace(/[^\w\s]/g, ' ')  // Remove punctuation
        .split(/\s+/)               // Split on whitespace
        .filter(token => token.length > 2);  // Remove short tokens
}

/**
 * Extract keywords from query using simple heuristics
 * @param {string} query - Search query
 * @returns {Array<string>} Important keywords
 */
function extractKeywords(query) {
    const stopWords = new Set([
        'what', 'where', 'when', 'who', 'why', 'how',
        'the', 'is', 'are', 'was', 'were', 'be', 'been',
        'have', 'has', 'had', 'do', 'does', 'did',
        'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at',
        'to', 'for', 'of', 'with', 'by', 'from',
        'tell', 'me', 'about', 'show', 'give'
    ]);

    return tokenize(query.toLowerCase())
        .filter(word => !stopWords.has(word) && word.length > 2);
}

/**
 * Perform keyword-based search in Firestore
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Keyword search results with scores
 */
async function keywordSearch(query, options = {}) {
    const {
        language = 'en',
        minScore = 0.1,
        topK = 10
    } = options;

    try {
        const keywords = extractKeywords(query);
        
        if (keywords.length === 0) {
            return [];
        }

        // Get all documents from Firestore for the language
        const knowledgeRef = collection(db, 'knowledge_base');
        const q = firestoreQuery(knowledgeRef, where('metadata.language', '==', language));
        const snapshot = await getDocs(q);

        const results = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const text = `${data.title} ${data.content}`.toLowerCase();
            
            // Check if any keywords match
            const hasMatch = keywords.some(keyword => text.includes(keyword));
            
            if (hasMatch) {
                const score = calculateBM25Score(query, data.content);
                
                if (score >= minScore) {
                    results.push({
                        id: doc.id,
                        ...data,
                        keywordScore: score,
                        matchedKeywords: keywords.filter(kw => text.includes(kw))
                    });
                }
            }
        });

        // Sort by BM25 score and return top K
        return results
            .sort((a, b) => b.keywordScore - a.keywordScore)
            .slice(0, topK);

    } catch (error) {
        console.error('Keyword search failed:', error);
        return [];
    }
}

/**
 * Combine and rank results from vector and keyword search
 * @param {Array} vectorResults - Results from vector similarity search
 * @param {Array} keywordResults - Results from keyword search
 * @param {Object} options - Ranking options
 * @returns {Array} Combined and ranked results
 */
function combineResults(vectorResults, keywordResults, options = {}) {
    const {
        vectorWeight = 0.6,      // Weight for vector similarity
        keywordWeight = 0.4,     // Weight for keyword matching
        diversityBonus = 0.1     // Bonus for diverse categories
    } = options;

    // Create a map of all unique documents
    const resultsMap = new Map();

    // Add vector results
    vectorResults.forEach(result => {
        resultsMap.set(result.id, {
            ...result,
            vectorScore: result.similarity || 0,
            keywordScore: 0,
            matchedKeywords: []
        });
    });

    // Add or merge keyword results
    keywordResults.forEach(result => {
        if (resultsMap.has(result.id)) {
            const existing = resultsMap.get(result.id);
            existing.keywordScore = result.keywordScore;
            existing.matchedKeywords = result.matchedKeywords;
        } else {
            resultsMap.set(result.id, {
                ...result,
                vectorScore: 0,
                keywordScore: result.keywordScore
            });
        }
    });

    // Calculate hybrid scores
    const results = Array.from(resultsMap.values()).map(result => {
        const baseScore = 
            (result.vectorScore * vectorWeight) + 
            (result.keywordScore * keywordWeight);
        
        // Apply diversity bonus (prefer results from different categories)
        const categoryBonus = result.category ? diversityBonus : 0;
        
        const hybridScore = baseScore + categoryBonus;

        return {
            ...result,
            hybridScore,
            searchType: result.vectorScore > 0 && result.keywordScore > 0 
                ? 'hybrid' 
                : result.vectorScore > 0 
                ? 'vector' 
                : 'keyword'
        };
    });

    // Sort by hybrid score
    return results.sort((a, b) => b.hybridScore - a.hybridScore);
}

/**
 * Perform hybrid search combining vector and keyword approaches
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Ranked hybrid search results
 */
export async function hybridSearch(query, options = {}) {
    const {
        language = 'en',
        topK = 5,
        threshold = 0.2,
        vectorWeight = 0.6,
        keywordWeight = 0.4,
        useKeywordSearch = true,
        useVectorSearch = true
    } = options;

    try {
        // Run both searches in parallel
        const [vectorResults, keywordResults] = await Promise.all([
            useVectorSearch 
                ? searchSimilarKnowledge(query, { language, topK: topK * 2, threshold })
                : Promise.resolve([]),
            useKeywordSearch 
                ? keywordSearch(query, { language, topK: topK * 2 })
                : Promise.resolve([])
        ]);

        // Combine and rank results
        const combinedResults = combineResults(
            vectorResults, 
            keywordResults, 
            { vectorWeight, keywordWeight }
        );

        // Return top K results
        return combinedResults.slice(0, topK);

    } catch (error) {
        console.error('Hybrid search failed:', error);
        
        // Fallback to vector search only
        if (useVectorSearch) {
            console.log('Falling back to vector search only');
            return searchSimilarKnowledge(query, { language, topK, threshold });
        }
        
        return [];
    }
}

/**
 * Get search statistics for analytics
 * @param {Array} results - Hybrid search results
 * @returns {Object} Search statistics
 */
export function getSearchStats(results) {
    const stats = {
        totalResults: results.length,
        hybridMatches: 0,
        vectorOnlyMatches: 0,
        keywordOnlyMatches: 0,
        avgHybridScore: 0,
        avgVectorScore: 0,
        avgKeywordScore: 0,
        categories: new Set()
    };

    results.forEach(result => {
        if (result.searchType === 'hybrid') stats.hybridMatches++;
        else if (result.searchType === 'vector') stats.vectorOnlyMatches++;
        else if (result.searchType === 'keyword') stats.keywordOnlyMatches++;
        
        stats.avgHybridScore += result.hybridScore || 0;
        stats.avgVectorScore += result.vectorScore || 0;
        stats.avgKeywordScore += result.keywordScore || 0;
        
        if (result.category) stats.categories.add(result.category);
    });

    if (results.length > 0) {
        stats.avgHybridScore /= results.length;
        stats.avgVectorScore /= results.length;
        stats.avgKeywordScore /= results.length;
    }

    stats.categories = Array.from(stats.categories);

    return stats;
}

export default hybridSearch;
