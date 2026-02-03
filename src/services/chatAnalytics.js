// Chat Analytics Service - Track conversations and metrics
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc,
  doc, 
  getDocs, 
  query, 
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// Log chat interaction for analytics
export const logChatAnalytics = async (analyticsData) => {
  try {
    const {
      sessionId,
      question,
      answer,
      retrievedDocs = [],
      responseTime = 0,
      language = 'en'
    } = analyticsData;
    
    await addDoc(collection(db, 'chat_analytics'), {
      sessionId,
      question,
      answer,
      retrievedDocs,
      responseTime,
      language,
      feedback: null, // Will be updated later
      timestamp: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error logging analytics:', error);
    return { success: false, error: error.message };
  }
};

// Update feedback for a chat interaction
export const updateChatFeedback = async (analyticsId, feedback) => {
  try {
    const docRef = doc(db, 'chat_analytics', analyticsId);
    await updateDoc(docRef, { feedback });
    return { success: true };
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw error;
  }
};

// Save chat session
export const saveChatSession = async (sessionId, messages, metadata = {}) => {
  try {
    const sessionRef = doc(db, 'chat_sessions', sessionId);
    await updateDoc(sessionRef, {
      messages,
      metadata: {
        ...metadata,
        totalMessages: messages.length,
        lastActivity: serverTimestamp()
      }
    }).catch(async () => {
      // If document doesn't exist, create it
      await addDoc(collection(db, 'chat_sessions'), {
        sessionId,
        messages,
        metadata: {
          ...metadata,
          totalMessages: messages.length,
          createdAt: serverTimestamp(),
          lastActivity: serverTimestamp()
        }
      });
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving session:', error);
    return { success: false };
  }
};

// Get analytics summary for admin dashboard
export const getAnalyticsSummary = async (days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const q = query(
      collection(db, 'chat_analytics'),
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const analytics = [];
    
    snapshot.forEach((doc) => {
      analytics.push({ id: doc.id, ...doc.data() });
    });
    
    // Calculate metrics
    const totalChats = analytics.length;
    const positiveFeedback = analytics.filter(a => a.feedback === 'thumbs_up').length;
    const negativeFeedback = analytics.filter(a => a.feedback === 'thumbs_down').length;
    const avgResponseTime = analytics.reduce((sum, a) => sum + (a.responseTime || 0), 0) / totalChats || 0;
    
    // Top questions
    const questionCounts = {};
    analytics.forEach(a => {
      const q = a.question.toLowerCase();
      questionCounts[q] = (questionCounts[q] || 0) + 1;
    });
    
    const topQuestions = Object.entries(questionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([question, count]) => ({ question, count }));
    
    return {
      totalChats,
      positiveFeedback,
      negativeFeedback,
      feedbackRate: totalChats > 0 ? ((positiveFeedback + negativeFeedback) / totalChats * 100).toFixed(1) : 0,
      satisfactionRate: (positiveFeedback + negativeFeedback) > 0 
        ? (positiveFeedback / (positiveFeedback + negativeFeedback) * 100).toFixed(1) 
        : 0,
      avgResponseTime: avgResponseTime.toFixed(0),
      topQuestions,
      recentChats: analytics.slice(0, 20)
    };
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    throw error;
  }
};

// Get popular topics based on retrieved documents
export const getPopularTopics = async (limit = 10) => {
  try {
    const q = query(
      collection(db, 'chat_analytics'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    
    const snapshot = await getDocs(q);
    const topicCounts = {};
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.retrievedDocs && data.retrievedDocs.length > 0) {
        data.retrievedDocs.forEach(docId => {
          topicCounts[docId] = (topicCounts[docId] || 0) + 1;
        });
      }
    });
    
    return Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([docId, count]) => ({ docId, count }));
  } catch (error) {
    console.error('Error getting popular topics:', error);
    return [];
  }
};
