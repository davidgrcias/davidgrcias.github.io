/**
 * RAG Chatbot Verification Script
 * Run this in browser console to verify all features work
 * 
 * Usage:
 * 1. Open http://localhost:5176
 * 2. Open DevTools Console (F12)
 * 3. Copy-paste this entire file
 * 4. Run: await verifyAll()
 */

async function verifyAll() {
    console.log('🚀 Starting RAG Chatbot Verification...\n');
    console.log('=' .repeat(60));
    
    const results = {
        passed: [],
        failed: [],
        warnings: []
    };
    
    // Test 1: Check imports
    console.log('\n📦 Test 1: Checking module imports...');
    try {
        const { hybridSearch } = await import('/src/services/hybridSearch.js');
        const { searchSimilarKnowledge, generateEmbedding } = await import('/src/services/vectorStore.js');
        const { embeddingCache, searchCache } = await import('/src/utils/performance.js');
        
        if (hybridSearch && searchSimilarKnowledge && generateEmbedding && embeddingCache && searchCache) {
            results.passed.push('Module imports successful');
            console.log('✅ All modules loaded');
        } else {
            throw new Error('Some modules failed to load');
        }
    } catch (error) {
        results.failed.push(`Module imports: ${error.message}`);
        console.error('❌ Module import failed:', error);
    }
    
    // Test 2: Check API endpoints
    console.log('\n🌐 Test 2: Checking API endpoints...');
    const endpoints = [
        { url: 'https://davidgrcias-github-io-davidgrcias-projects-cc8794a2.vercel.app/api/embeddings', method: 'POST' },
        { url: 'https://davidgrcias-github-io-davidgrcias-projects-cc8794a2.vercel.app/api/chat-rag', method: 'POST' },
        { url: 'https://davidgrcias-github-io-davidgrcias-projects-cc8794a2.vercel.app/api/chat-stream?message=test&language=en&useRAG=true&context=[]&retrievedDocs=[]', method: 'GET' }
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint.url, {
                method: endpoint.method,
                headers: { 'Content-Type': 'application/json' },
                body: endpoint.method === 'POST' ? JSON.stringify({ text: 'test' }) : undefined
            });
            
            if (response.ok || response.status === 400) { // 400 is OK for test payload
                results.passed.push(`API ${endpoint.url.split('/').pop()} reachable`);
                console.log(`✅ ${endpoint.url.split('/').pop()} - Status ${response.status}`);
            } else {
                throw new Error(`Status ${response.status}`);
            }
        } catch (error) {
            results.failed.push(`API ${endpoint.url.split('/').pop()}: ${error.message}`);
            console.error(`❌ ${endpoint.url.split('/').pop()} failed:`, error);
        }
    }
    
    // Test 3: Check Firebase connection
    console.log('\n🔥 Test 3: Checking Firebase connection...');
    try {
        const { db } = await import('/src/config/firebase.js');
        if (db) {
            results.passed.push('Firebase initialized');
            console.log('✅ Firebase DB connected');
        } else {
            throw new Error('Firebase DB not initialized');
        }
    } catch (error) {
        results.failed.push(`Firebase: ${error.message}`);
        console.error('❌ Firebase connection failed:', error);
    }
    
    // Test 4: Check browser APIs
    console.log('\n🎤 Test 4: Checking browser APIs...');
    
    // Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        results.passed.push('Speech Recognition available');
        console.log('✅ Speech Recognition supported');
    } else {
        results.warnings.push('Speech Recognition not supported in this browser');
        console.warn('⚠️ Speech Recognition not available - Use Chrome/Edge');
    }
    
    // Speech Synthesis
    if ('speechSynthesis' in window) {
        results.passed.push('Speech Synthesis available');
        console.log('✅ Speech Synthesis supported');
    } else {
        results.warnings.push('Speech Synthesis not supported');
        console.warn('⚠️ Speech Synthesis not available');
    }
    
    // EventSource
    if ('EventSource' in window) {
        results.passed.push('EventSource available');
        console.log('✅ EventSource supported (streaming works)');
    } else {
        results.failed.push('EventSource not supported - Streaming will fail');
        console.error('❌ EventSource not available');
    }
    
    // IndexedDB
    if ('indexedDB' in window) {
        results.passed.push('IndexedDB available');
        console.log('✅ IndexedDB supported (persistent cache works)');
    } else {
        results.warnings.push('IndexedDB not supported - Cache won\'t persist');
        console.warn('⚠️ IndexedDB not available');
    }
    
    // Test 5: Check UI elements
    console.log('\n🎨 Test 5: Checking UI elements...');
    
    const requiredElements = [
        { selector: 'input[type="text"]', name: 'Message input' },
        { selector: 'button[type="submit"]', name: 'Send button' },
    ];
    
    for (const element of requiredElements) {
        const el = document.querySelector(element.selector);
        if (el) {
            results.passed.push(`UI: ${element.name} found`);
            console.log(`✅ ${element.name} exists`);
        } else {
            results.warnings.push(`UI: ${element.name} not found (may not be on Messenger app page)`);
            console.warn(`⚠️ ${element.name} not found - Are you on the Messenger app?`);
        }
    }
    
    // Test 6: Check localStorage
    console.log('\n💾 Test 6: Checking localStorage...');
    try {
        localStorage.setItem('test', 'value');
        if (localStorage.getItem('test') === 'value') {
            localStorage.removeItem('test');
            results.passed.push('localStorage working');
            console.log('✅ localStorage read/write works');
        } else {
            throw new Error('Value mismatch');
        }
    } catch (error) {
        results.failed.push(`localStorage: ${error.message}`);
        console.error('❌ localStorage failed:', error);
    }
    
    // Test 7: Network connectivity
    console.log('\n🌍 Test 7: Checking network connectivity...');
    if (navigator.onLine) {
        results.passed.push('Network connected');
        console.log('✅ Online');
    } else {
        results.failed.push('Network offline');
        console.error('❌ Offline - APIs will fail');
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\n✅ Passed: ${results.passed.length}`);
    results.passed.forEach(item => console.log(`  - ${item}`));
    
    if (results.warnings.length > 0) {
        console.log(`\n⚠️ Warnings: ${results.warnings.length}`);
        results.warnings.forEach(item => console.log(`  - ${item}`));
    }
    
    if (results.failed.length > 0) {
        console.log(`\n❌ Failed: ${results.failed.length}`);
        results.failed.forEach(item => console.log(`  - ${item}`));
    }
    
    const totalTests = results.passed.length + results.warnings.length + results.failed.length;
    const successRate = ((results.passed.length / totalTests) * 100).toFixed(1);
    
    console.log(`\n📈 Success Rate: ${successRate}%`);
    
    if (results.failed.length === 0) {
        console.log('\n🎉 ALL CRITICAL TESTS PASSED!');
        console.log('✅ System ready for testing');
    } else {
        console.log('\n⚠️ SOME TESTS FAILED - Review errors above');
    }
    
    console.log('\n' + '='.repeat(60));
    
    return {
        passed: results.passed.length,
        warnings: results.warnings.length,
        failed: results.failed.length,
        successRate: `${successRate}%`,
        details: results
    };
}

// Quick test functions for manual testing

async function testEmbedding() {
    console.log('🧪 Testing embedding generation...');
    const { generateEmbedding } = await import('/src/services/vectorStore.js');
    
    const start = Date.now();
    const embedding = await generateEmbedding('test query');
    const duration = Date.now() - start;
    
    console.log(`✅ Embedding generated in ${duration}ms`);
    console.log(`📊 Dimension: ${embedding.length}`);
    console.log(`🔢 Sample values:`, embedding.slice(0, 5));
    
    return { embedding, duration };
}

async function testSearch() {
    console.log('🔍 Testing vector search...');
    const { searchSimilarKnowledge } = await import('/src/services/vectorStore.js');
    
    const start = Date.now();
    const results = await searchSimilarKnowledge('programming skills', { topK: 3 });
    const duration = Date.now() - start;
    
    console.log(`✅ Search completed in ${duration}ms`);
    console.log(`📊 Results found: ${results.length}`);
    results.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.title} (similarity: ${r.similarity.toFixed(3)})`);
    });
    
    return { results, duration };
}

async function testHybridSearch() {
    console.log('🔍 Testing hybrid search...');
    const { hybridSearch } = await import('/src/services/hybridSearch.js');
    
    const start = Date.now();
    const results = await hybridSearch('React projects', { topK: 3, language: 'en' });
    const duration = Date.now() - start;
    
    console.log(`✅ Hybrid search completed in ${duration}ms`);
    console.log(`📊 Results found: ${results.length}`);
    results.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.title}`);
        console.log(`     - Vector: ${r.vectorScore?.toFixed(3) || 0}`);
        console.log(`     - Keyword: ${r.keywordScore?.toFixed(3) || 0}`);
        console.log(`     - Hybrid: ${r.hybridScore?.toFixed(3) || 0}`);
        console.log(`     - Type: ${r.searchType}`);
    });
    
    return { results, duration };
}

async function testCache() {
    console.log('💾 Testing cache performance...');
    const { generateEmbedding } = await import('/src/services/vectorStore.js');
    const { embeddingCache } = await import('/src/utils/performance.js');
    
    embeddingCache.clear();
    console.log('🧹 Cache cleared');
    
    // Cold run
    const start1 = Date.now();
    await generateEmbedding('cache test query');
    const cold = Date.now() - start1;
    
    // Warm run
    const start2 = Date.now();
    await generateEmbedding('cache test query');
    const warm = Date.now() - start2;
    
    const speedup = (cold / warm).toFixed(1);
    
    console.log(`❄️ Cold run: ${cold}ms`);
    console.log(`🔥 Warm run: ${warm}ms`);
    console.log(`⚡ Speedup: ${speedup}x`);
    console.log(`📊 Cache size: ${embeddingCache.size} items`);
    
    if (warm < cold / 10) {
        console.log('✅ Cache working perfectly!');
    } else if (warm < cold / 2) {
        console.log('⚠️ Cache working but could be faster');
    } else {
        console.log('❌ Cache not working properly');
    }
    
    return { cold, warm, speedup };
}

async function testStreaming() {
    console.log('📡 Testing streaming API...');
    
    const url = new URL('https://davidgrcias-github-io-davidgrcias-projects-cc8794a2.vercel.app/api/chat-stream');
    url.searchParams.set('message', 'Tell me a joke');
    url.searchParams.set('language', 'en');
    url.searchParams.set('useRAG', 'false');
    url.searchParams.set('context', '[]');
    url.searchParams.set('retrievedDocs', '[]');
    
    return new Promise((resolve, reject) => {
        const eventSource = new EventSource(url.toString());
        let chunks = 0;
        let fullText = '';
        const startTime = Date.now();
        
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'chunk') {
                chunks++;
                fullText += data.chunk;
                console.log(`📦 Chunk ${chunks}: "${data.chunk}"`);
            } else if (data.type === 'done') {
                const duration = Date.now() - startTime;
                eventSource.close();
                
                console.log(`✅ Streaming complete in ${duration}ms`);
                console.log(`📊 Total chunks: ${chunks}`);
                console.log(`📝 Full text: "${data.fullText}"`);
                
                resolve({ chunks, fullText: data.fullText, duration });
            } else if (data.type === 'error') {
                eventSource.close();
                console.error('❌ Streaming error:', data.error);
                reject(new Error(data.error));
            }
        };
        
        eventSource.onerror = (error) => {
            eventSource.close();
            console.error('❌ EventSource error:', error);
            reject(error);
        };
        
        setTimeout(() => {
            eventSource.close();
            reject(new Error('Timeout after 30s'));
        }, 30000);
    });
}

// Export for console use
console.log('🎯 RAG Chatbot Verification Script Loaded');
console.log('');
console.log('Available commands:');
console.log('  - await verifyAll()       : Run all verification tests');
console.log('  - await testEmbedding()   : Test embedding generation');
console.log('  - await testSearch()      : Test vector search');
console.log('  - await testHybridSearch(): Test hybrid search');
console.log('  - await testCache()       : Test cache performance');
console.log('  - await testStreaming()   : Test streaming API');
console.log('');
console.log('👉 Start with: await verifyAll()');
console.log('');

// Auto-export to window for easy access
window.verifyRAG = verifyAll;
window.testEmbedding = testEmbedding;
window.testSearch = testSearch;
window.testHybridSearch = testHybridSearch;
window.testCache = testCache;
window.testStreaming = testStreaming;
