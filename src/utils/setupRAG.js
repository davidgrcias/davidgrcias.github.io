// Quick Setup & Test Script for RAG System
// Run this in browser console after logging into admin panel

import { migrateAllLanguages } from '../utils/migrateKnowledge';
import { searchSimilarKnowledge } from '../services/vectorStore';
import { getAllKnowledge } from '../services/vectorStore';

export const setupRAGSystem = async () => {
  console.log('🚀 Starting RAG System Setup...\n');

  try {
    // Step 1: Check if knowledge base is empty
    console.log('📊 Step 1: Checking existing knowledge...');
    const existing = await getAllKnowledge();
    console.log(`   Found ${existing.length} existing entries`);

    if (existing.length === 0) {
      console.log('\n📦 Step 2: Migrating knowledge base...');
      console.log('   This may take a few minutes...');
      
      const results = await migrateAllLanguages();
      
      console.log('\n✅ Migration Complete!');
      console.log(`   English: ${results.en?.success?.length || 0} success, ${results.en?.failed?.length || 0} failed`);
      console.log(`   Indonesian: ${results.id?.success?.length || 0} success, ${results.id?.failed?.length || 0} failed`);
    } else {
      console.log('   ✓ Knowledge base already populated');
    }

    // Step 3: Test vector search
    console.log('\n🔍 Step 3: Testing vector search...');
    const testQuery = "What are David's technical skills?";
    console.log(`   Query: "${testQuery}"`);
    
    const results = await searchSimilarKnowledge(testQuery, {
      topK: 3,
      language: 'en',
      threshold: 0.3
    });

    console.log(`   Found ${results.length} relevant documents:`);
    results.forEach((doc, idx) => {
      console.log(`   ${idx + 1}. ${doc.title} (similarity: ${(doc.similarity * 100).toFixed(1)}%)`);
    });

    // Step 4: Check API endpoints
    console.log('\n🌐 Step 4: Testing API endpoints...');
    
    try {
      const embeddingTest = await fetch('/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'test' })
      });
      
      if (embeddingTest.ok) {
        console.log('   ✓ Embeddings API working');
      } else {
        console.log('   ✗ Embeddings API failed');
      }
    } catch (error) {
      console.log('   ✗ Embeddings API not accessible');
    }

    console.log('\n🎉 Setup Complete!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Open Messages app in the OS');
    console.log('   2. Toggle "Smart Mode (RAG)" to ON');
    console.log('   3. Ask a question about David');
    console.log('   4. Check /admin/knowledge to manage entries');
    console.log('   5. Check /admin/chat-analytics to view metrics');

    return {
      success: true,
      knowledgeCount: existing.length || (results.en?.success?.length || 0) + (results.id?.success?.length || 0),
      testResults: results
    };

  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure you\'re logged into admin panel');
    console.log('   2. Check Firebase is configured (.env file)');
    console.log('   3. Verify Gemini API key is valid');
    console.log('   4. Check browser console for errors');
    
    return {
      success: false,
      error: error.message
    };
  }
};

// Test individual components
export const testEmbeddings = async (text = "Hello world") => {
  console.log(`Testing embeddings for: "${text}"`);
  
  try {
    const response = await fetch('/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    
    const data = await response.json();
    console.log('✓ Embedding generated:', {
      dimensions: data.dimensions,
      sample: data.embedding.slice(0, 5),
      fallback: data.fallback || false
    });
    
    return data;
  } catch (error) {
    console.error('✗ Embedding test failed:', error);
    return null;
  }
};

export const testRAGChat = async (question = "What are David's skills?") => {
  console.log(`Testing RAG chat with: "${question}"`);
  
  try {
    // Search for relevant docs
    const docs = await searchSimilarKnowledge(question, {
      topK: 3,
      language: 'en'
    });
    
    console.log(`Found ${docs.length} relevant documents`);
    
    // Call RAG API
    const response = await fetch('/api/chat-rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: question,
        retrievedDocs: docs.map(d => ({
          id: d.id,
          title: d.title,
          content: d.content,
          similarity: d.similarity
        })),
        language: 'en',
        useRAG: true
      })
    });
    
    const data = await response.json();
    console.log('✓ RAG response:', {
      responseTime: data.responseTime + 'ms',
      sourcesCount: data.sources?.length || 0,
      answer: data.response.substring(0, 200) + '...'
    });
    
    return data;
  } catch (error) {
    console.error('✗ RAG test failed:', error);
    return null;
  }
};

export const quickStats = async () => {
  const knowledge = await getAllKnowledge();
  
  const stats = {
    total: knowledge.length,
    byLanguage: {
      en: knowledge.filter(k => k.metadata.language === 'en').length,
      id: knowledge.filter(k => k.metadata.language === 'id').length
    },
    byCategory: {},
    byType: {}
  };
  
  knowledge.forEach(k => {
    stats.byCategory[k.category] = (stats.byCategory[k.category] || 0) + 1;
    stats.byType[k.type] = (stats.byType[k.type] || 0) + 1;
  });
  
  console.table(stats.byLanguage);
  console.table(stats.byCategory);
  console.table(stats.byType);
  
  return stats;
};

// Auto-run setup if this script is imported
console.log('💡 RAG System Setup Script Loaded!');
console.log('   Run: await setupRAGSystem()');
console.log('   Or test: await testRAGChat("your question")');
