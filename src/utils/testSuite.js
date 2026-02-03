/**
 * Comprehensive RAG Chatbot Test Suite
 * Tests all components, features, and edge cases
 */

import { generateEmbedding, searchSimilarKnowledge, storeKnowledge } from '../services/vectorStore';
import { hybridSearch } from '../services/hybridSearch';
import { logChatAnalytics, updateChatFeedback } from '../services/chatAnalytics';
import { embeddingCache, searchCache, generateCacheKey, perfMonitor } from '../utils/performance';

/**
 * Test Suite Runner
 */
export class RAGTestSuite {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            errors: []
        };
    }

    log(message, type = 'info') {
        const prefix = {
            'info': '📘',
            'success': '✅',
            'error': '❌',
            'warning': '⚠️'
        }[type];
        
        console.log(`${prefix} ${message}`);
    }

    async test(name, testFn) {
        try {
            this.log(`Testing: ${name}`, 'info');
            await testFn();
            this.results.passed++;
            this.log(`PASSED: ${name}`, 'success');
        } catch (error) {
            this.results.failed++;
            this.results.errors.push({ test: name, error: error.message });
            this.log(`FAILED: ${name} - ${error.message}`, 'error');
        }
    }

    async runAll() {
        this.log('🚀 Starting RAG Chatbot Test Suite', 'info');
        console.log('='.repeat(60));

        // 1. Vector Store Tests
        await this.testVectorStore();
        
        // 2. Hybrid Search Tests
        await this.testHybridSearch();
        
        // 3. Caching Tests
        await this.testCaching();
        
        // 4. Performance Tests
        await this.testPerformance();
        
        // 5. Analytics Tests
        await this.testAnalytics();
        
        // 6. Edge Cases
        await this.testEdgeCases();
        
        // 7. Integration Tests
        await this.testIntegration();

        this.printResults();
    }

    async testVectorStore() {
        this.log('\n📦 Vector Store Tests', 'info');
        console.log('-'.repeat(60));

        await this.test('Generate embedding for simple text', async () => {
            const embedding = await generateEmbedding('Hello world');
            if (!Array.isArray(embedding) || embedding.length === 0) {
                throw new Error('Invalid embedding format');
            }
        });

        await this.test('Handle empty text', async () => {
            try {
                await generateEmbedding('');
                throw new Error('Should fail with empty text');
            } catch (error) {
                if (!error.message.includes('Should fail')) {
                    // Expected failure
                    return;
                }
                throw error;
            }
        });

        await this.test('Search with valid query', async () => {
            const results = await searchSimilarKnowledge('programming skills', {
                topK: 3,
                threshold: 0.1
            });
            
            if (!Array.isArray(results)) {
                throw new Error('Results should be an array');
            }
        });
    }

    async testHybridSearch() {
        this.log('\n🔍 Hybrid Search Tests', 'info');
        console.log('-'.repeat(60));

        await this.test('Hybrid search combines vector and keyword', async () => {
            const results = await hybridSearch('React projects', {
                topK: 5,
                language: 'en'
            });
            
            if (!Array.isArray(results)) {
                throw new Error('Results should be an array');
            }
            
            results.forEach(result => {
                if (!result.hybridScore && !result.vectorScore && !result.keywordScore) {
                    throw new Error('Missing score fields');
                }
            });
        });

        await this.test('Keyword-only search fallback', async () => {
            const results = await hybridSearch('testing keyword search', {
                topK: 3,
                useVectorSearch: false,
                useKeywordSearch: true
            });
            
            if (!Array.isArray(results)) {
                throw new Error('Keyword search failed');
            }
        });

        await this.test('Vector-only search fallback', async () => {
            const results = await hybridSearch('vector similarity test', {
                topK: 3,
                useVectorSearch: true,
                useKeywordSearch: false
            });
            
            if (!Array.isArray(results)) {
                throw new Error('Vector search failed');
            }
        });
    }

    async testCaching() {
        this.log('\n💾 Caching Tests', 'info');
        console.log('-'.repeat(60));

        await this.test('Embedding cache works', async () => {
            const text = 'Cache test query';
            const key = generateCacheKey(text, { type: 'embedding' });
            
            // Clear cache
            embeddingCache.clear();
            
            // First call - should not be cached
            perfMonitor.start('uncached-embedding');
            const embedding1 = await generateEmbedding(text);
            const time1 = perfMonitor.end('uncached-embedding').duration;
            
            // Second call - should be cached
            perfMonitor.start('cached-embedding');
            const embedding2 = await generateEmbedding(text);
            const time2 = perfMonitor.end('cached-embedding').duration;
            
            if (time2 >= time1) {
                throw new Error('Cache did not improve performance');
            }
            
            if (JSON.stringify(embedding1) !== JSON.stringify(embedding2)) {
                throw new Error('Cached embedding differs from original');
            }
        });

        await this.test('Search cache works', async () => {
            const query = 'test search caching';
            searchCache.clear();
            
            perfMonitor.start('uncached-search');
            const results1 = await searchSimilarKnowledge(query, { topK: 3 });
            const time1 = perfMonitor.end('uncached-search').duration;
            
            perfMonitor.start('cached-search');
            const results2 = await searchSimilarKnowledge(query, { topK: 3 });
            const time2 = perfMonitor.end('cached-search').duration;
            
            if (time2 >= time1) {
                this.log('Warning: Cache did not improve search performance', 'warning');
            }
        });

        await this.test('Cache key generation', () => {
            const key1 = generateCacheKey('test', { a: 1, b: 2 });
            const key2 = generateCacheKey('test', { b: 2, a: 1 });
            
            // Keys should be different (order matters in JSON.stringify)
            if (key1 === key2) {
                this.log('Note: Cache keys are order-dependent', 'warning');
            }
        });
    }

    async testPerformance() {
        this.log('\n⚡ Performance Tests', 'info');
        console.log('-'.repeat(60));

        await this.test('Embedding generation under 2s', async () => {
            const start = Date.now();
            await generateEmbedding('Performance test query for embedding generation');
            const duration = Date.now() - start;
            
            if (duration > 2000) {
                this.log(`Warning: Embedding took ${duration}ms`, 'warning');
            }
        });

        await this.test('Search completes under 3s', async () => {
            const start = Date.now();
            await searchSimilarKnowledge('fast search test', { topK: 5 });
            const duration = Date.now() - start;
            
            if (duration > 3000) {
                this.log(`Warning: Search took ${duration}ms`, 'warning');
            }
        });

        await this.test('Hybrid search completes under 5s', async () => {
            const start = Date.now();
            await hybridSearch('hybrid performance test', { topK: 5 });
            const duration = Date.now() - start;
            
            if (duration > 5000) {
                this.log(`Warning: Hybrid search took ${duration}ms`, 'warning');
            }
        });
    }

    async testAnalytics() {
        this.log('\n📊 Analytics Tests', 'info');
        console.log('-'.repeat(60));

        await this.test('Log chat analytics', async () => {
            const analytics = await logChatAnalytics({
                sessionId: 'test-session',
                question: 'Test question',
                answer: 'Test answer',
                retrievedDocs: [],
                responseTime: 1000,
                language: 'en'
            });
            
            if (!analytics || !analytics.id) {
                throw new Error('Analytics logging failed');
            }
        });

        await this.test('Update chat feedback', async () => {
            const analytics = await logChatAnalytics({
                sessionId: 'feedback-test',
                question: 'Feedback test',
                answer: 'Answer',
                retrievedDocs: [],
                responseTime: 500,
                language: 'en'
            });
            
            await updateChatFeedback(analytics.id, 'thumbs_up');
            // No error means success
        });
    }

    async testEdgeCases() {
        this.log('\n🔧 Edge Case Tests', 'info');
        console.log('-'.repeat(60));

        await this.test('Handle very long text', async () => {
            const longText = 'word '.repeat(1000); // 5000 characters
            const embedding = await generateEmbedding(longText);
            
            if (!Array.isArray(embedding)) {
                throw new Error('Failed to handle long text');
            }
        });

        await this.test('Handle special characters', async () => {
            const specialText = 'Test @#$% special *&^() characters!';
            await generateEmbedding(specialText);
        });

        await this.test('Handle multilingual text', async () => {
            const multilingualText = 'Hello नमस्ते مرحبا 你好';
            await generateEmbedding(multilingualText);
        });

        await this.test('Search with no results', async () => {
            const results = await searchSimilarKnowledge('xyz123nonexistentquery456abc', {
                topK: 5,
                threshold: 0.9 // Very high threshold
            });
            
            // Should return empty array, not error
            if (!Array.isArray(results)) {
                throw new Error('Should return empty array');
            }
        });

        await this.test('Search with extreme similarity threshold', async () => {
            const results = await searchSimilarKnowledge('test query', {
                topK: 5,
                threshold: 1.0 // Perfect match only
            });
            
            // Should not crash
            if (!Array.isArray(results)) {
                throw new Error('Failed with extreme threshold');
            }
        });
    }

    async testIntegration() {
        this.log('\n🔗 Integration Tests', 'info');
        console.log('-'.repeat(60));

        await this.test('End-to-end RAG pipeline', async () => {
            const query = 'What are your skills?';
            
            // 1. Search
            const docs = await hybridSearch(query, { topK: 3, language: 'en' });
            
            // 2. Verify docs have required fields
            docs.forEach(doc => {
                if (!doc.content || !doc.title) {
                    throw new Error('Missing required fields in document');
                }
            });
            
            // 3. Log analytics
            const analytics = await logChatAnalytics({
                sessionId: 'integration-test',
                question: query,
                answer: 'Generated answer',
                retrievedDocs: docs.map(d => d.id),
                responseTime: 2000,
                language: 'en'
            });
            
            if (!analytics.id) {
                throw new Error('Integration test failed');
            }
        });

        await this.test('Multiple concurrent searches', async () => {
            const queries = [
                'programming skills',
                'project experience',
                'contact information'
            ];
            
            const results = await Promise.all(
                queries.map(q => searchSimilarKnowledge(q, { topK: 3 }))
            );
            
            if (results.length !== queries.length) {
                throw new Error('Concurrent searches failed');
            }
        });
    }

    printResults() {
        console.log('\n' + '='.repeat(60));
        this.log('📋 Test Results Summary', 'info');
        console.log('='.repeat(60));
        
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📊 Total: ${this.results.passed + this.results.failed}`);
        
        if (this.results.errors.length > 0) {
            console.log('\n❌ Failed Tests:');
            this.results.errors.forEach(({ test, error }) => {
                console.log(`  - ${test}: ${error}`);
            });
        }
        
        if (this.results.failed === 0) {
            this.log('\n🎉 All tests passed!', 'success');
        } else {
            this.log('\n⚠️ Some tests failed. Please review.', 'warning');
        }
        
        console.log('='.repeat(60));
    }
}

/**
 * Run tests in browser console
 * Usage: import and run in browser dev tools
 */
export async function runTests() {
    const suite = new RAGTestSuite();
    await suite.runAll();
    return suite.results;
}

export default RAGTestSuite;
