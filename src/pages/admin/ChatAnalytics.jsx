import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Target,
  Download
} from 'lucide-react';
import { getAnalyticsSummary, getPopularTopics } from '../../services/chatAnalytics';

const ChatAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [popularTopics, setPopularTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [summary, topics] = await Promise.all([
        getAnalyticsSummary(days),
        getPopularTopics(10)
      ]);
      setAnalytics(summary);
      setPopularTopics(topics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    if (!analytics) return;
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-blue-500" />
            Chat Analytics
          </h1>
          <p className="text-gray-400 mt-1">
            Monitor chatbot performance and user interactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white focus:outline-none"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={exportAnalytics}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="text-blue-400 text-sm font-medium">Total Chats</div>
            <MessageSquare className="text-blue-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-white">
            {analytics?.totalChats || 0}
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="text-green-400 text-sm font-medium">Satisfaction</div>
            <ThumbsUp className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-white">
            {analytics?.satisfactionRate || 0}%
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {analytics?.positiveFeedback || 0} positive / {analytics?.negativeFeedback || 0} negative
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="text-purple-400 text-sm font-medium">Avg Response</div>
            <Clock className="text-purple-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-white">
            {analytics?.avgResponseTime || 0}ms
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="text-orange-400 text-sm font-medium">Feedback Rate</div>
            <Target className="text-orange-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-white">
            {analytics?.feedbackRate || 0}%
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Questions */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">
            Top Questions
          </h2>
          <div className="space-y-3">
            {analytics?.topQuestions?.slice(0, 10).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">
                    {item.question}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
                    {item.count}x
                  </div>
                </div>
              </div>
            )) || <p className="text-gray-500 text-sm">No data yet</p>}
          </div>
        </div>

        {/* Popular Topics */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">
            Popular Topics
          </h2>
          <div className="space-y-3">
            {popularTopics.slice(0, 10).map((topic, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">
                    Document ID: {topic.docId}
                  </p>
                </div>
                <div className="ml-4">
                  <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-medium">
                    {topic.count} views
                  </div>
                </div>
              </div>
            )) || <p className="text-gray-500 text-sm">No data yet</p>}
          </div>
        </div>
      </div>

      {/* Recent Chats */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4">
          Recent Conversations
        </h2>
        <div className="space-y-4">
          {analytics?.recentChats?.map((chat, idx) => (
            <div key={idx} className="border-b border-gray-800 pb-4 last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">
                    Q: {chat.question}
                  </p>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                    A: {chat.answer}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  {chat.feedback === 'thumbs_up' && (
                    <ThumbsUp className="text-green-500" size={16} />
                  )}
                  {chat.feedback === 'thumbs_down' && (
                    <ThumbsDown className="text-red-500" size={16} />
                  )}
                  <span className="text-xs text-gray-500">
                    {chat.responseTime}ms
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-600">
                {chat.timestamp?.toDate?.()?.toLocaleString() || 'N/A'}
              </div>
            </div>
          )) || <p className="text-gray-500 text-sm">No conversations yet</p>}
        </div>
      </div>
    </div>
  );
};

export default ChatAnalytics;
