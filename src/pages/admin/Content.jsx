import React, { useState, useEffect } from 'react';
import { Save, Loader2, Plus, Edit2, Trash2, Lightbulb, Sparkles, X } from 'lucide-react';
import { firestoreService } from '../../services/firestore';

const ICON_OPTIONS = ['MapIcon', 'HeartHandshake', 'Hourglass', 'Puzzle', 'User', 'Heart', 'Rocket', 'SkipBack', 'SearchCheck', 'Newspaper', 'Star', 'Zap', 'Coffee', 'Music', 'Book', 'Camera', 'Gamepad', 'Code'];

// Default data
const defaultFunFacts = [
  { id: 'default-1', title: "Hidden Talent", text: "Ask me about Jakarta's transport routes, I can tell you the best way to reach any destination using public transport!", icon: "MapIcon", isDefault: true },
  { id: 'default-2', title: "Surprising Fact", text: "Though I might seem reserved at first, I genuinely love meeting and chatting with new people.", icon: "HeartHandshake", isDefault: true },
  { id: 'default-3', title: "Most Productive Hours", text: "Late night hours are when my creativity and productivity peak.", icon: "Hourglass", isDefault: true },
  { id: 'default-4', title: "Best Way to Relax", text: "Nothing beats unwinding after a productive day of solving complex coding challenges.", icon: "Puzzle", isDefault: true }
];

const defaultInsights = [
  { id: 'default-1', title: "Motivation", text: "Fueled by ambition, not afraid to fail, because every setback is simply a setup for the next level.", icon: "Rocket", isDefault: true },
  { id: 'default-2', title: "Never Going Back", text: "I'll never return to being the shy and reserved person I once was. Now, I confidently embrace opportunities to speak and connect.", icon: "SkipBack", isDefault: true },
  { id: 'default-3', title: "What Keeps Me Curious", text: "I'm endlessly curious about how things work, whether complex systems or compelling stories.", icon: "SearchCheck", isDefault: true },
  { id: 'default-4', title: "How I Stay Updated", text: "I actively stay informed and up-to-date on current events, tech trends, and global developments.", icon: "Newspaper", isDefault: true }
];

const Content = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('funFacts');
  
  const [funFacts, setFunFacts] = useState([]);
  const [insights, setInsights] = useState([]);
  
  // Form state
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', text: '', icon: 'Star' });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      
      const [funFactsData, insightsData] = await Promise.all([
        firestoreService.getCollection('funFacts'),
        firestoreService.getCollection('insights')
      ]);

      setFunFacts(funFactsData && funFactsData.length > 0 ? funFactsData : defaultFunFacts);
      setInsights(insightsData && insightsData.length > 0 ? insightsData : defaultInsights);
    } catch (error) {
      console.error("Error fetching content:", error);
      setFunFacts(defaultFunFacts);
      setInsights(defaultInsights);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.text.trim()) {
      alert('Title and text are required');
      return;
    }

    setSaving(true);
    const collection = activeTab;
    
    try {
      const payload = {
        ...formData,
        updatedAt: new Date().toISOString()
      };

      if (editingItem && !editingItem.isStatic) {
        await firestoreService.updateDocument(collection, editingItem.id, payload);
        if (activeTab === 'funFacts') {
          setFunFacts(prev => prev.map(f => f.id === editingItem.id ? { ...f, ...payload } : f));
        } else {
          setInsights(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...payload } : i));
        }
      } else {
        payload.createdAt = new Date().toISOString();
        const docRef = await firestoreService.addDocument(collection, payload);
        const newItem = { ...payload, id: docRef.id };
        if (activeTab === 'funFacts') {
          setFunFacts(prev => [...prev, newItem]);
        } else {
          setInsights(prev => [...prev, newItem]);
        }
      }

      resetForm();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (item.isStatic) {
      alert("Static data cannot be deleted.");
      return;
    }
    if (!window.confirm(`Delete "${item.title}"?`)) return;

    const collection = activeTab;
    try {
      await firestoreService.deleteDocument(collection, item.id);
      if (activeTab === 'funFacts') {
        setFunFacts(prev => prev.filter(f => f.id !== item.id));
      } else {
        setInsights(prev => prev.filter(i => i.id !== item.id));
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete.");
    }
  };

  const handleEdit = (item) => {
    if (item.isStatic) {
      alert("Static data cannot be edited. Data will be copied for a new entry.");
      setEditingItem(null);
    } else {
      setEditingItem(item);
    }
    setFormData({ title: item.title, text: item.text, icon: item.icon || 'Star' });
  };

  const resetForm = () => {
    setFormData({ title: '', text: '', icon: 'Star' });
    setEditingItem(null);
  };

  const currentData = activeTab === 'funFacts' ? funFacts : insights;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Content</h1>
        <p className="text-gray-400">Manage fun facts and personal insights</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => { setActiveTab('funFacts'); resetForm(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
            activeTab === 'funFacts'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Lightbulb size={18} />
          Fun Facts ({funFacts.length})
        </button>
        <button
          onClick={() => { setActiveTab('insights'); resetForm(); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
            activeTab === 'insights'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Sparkles size={18} />
          Insights ({insights.length})
        </button>
      </div>

      {/* Static Warning */}
      {currentData.some(item => item.isStatic) && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-400 text-sm">
          ⚠️ Showing static data. Add new items to store in Firestore.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden sticky top-4">
            <div className="p-4 border-b border-gray-800 bg-gray-800/30 flex items-center justify-between">
              <h3 className="font-medium text-white">
                {editingItem ? 'Edit Item' : 'Add New'}
              </h3>
              {editingItem && (
                <button onClick={resetForm} className="text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                  placeholder="e.g. Hidden Talent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Text</label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white resize-none"
                  placeholder="Description text..."
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Icon</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                >
                  {ICON_OPTIONS.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {editingItem ? 'Update' : 'Add'} {activeTab === 'funFacts' ? 'Fun Fact' : 'Insight'}
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {currentData.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
              <Lightbulb size={48} className="mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-medium text-white mb-2">No items yet</h3>
              <p className="text-gray-400">Add your first {activeTab === 'funFacts' ? 'fun fact' : 'insight'}</p>
            </div>
          ) : (
            currentData.map((item) => (
              <div 
                key={item.id}
                className="bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-all p-4 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activeTab === 'funFacts' ? 'bg-yellow-500/20' : 'bg-purple-500/20'
                    }`}>
                      <span className="text-lg">{
                        activeTab === 'funFacts' ? '💡' : '✨'
                      }</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-white flex items-center gap-2">
                        {item.title}
                        {item.isStatic && (
                          <span className="text-xs bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded">static</span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">{item.text}</p>
                      <span className="text-xs text-gray-500 mt-2 inline-block">Icon: {item.icon}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-gray-800 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={item.isStatic}
                      className={`p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg ${
                        item.isStatic ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Content;
