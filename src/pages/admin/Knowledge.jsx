import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Save,
  X,
  Database,
  Upload,
  Download,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import {
  getAllKnowledge,
  storeKnowledge,
  updateKnowledge,
  deleteKnowledge,
  batchImportKnowledge
} from '../../services/vectorStore';
import { migrateAllLanguages } from '../../utils/migrateKnowledge';

const Knowledge = () => {
  const [knowledge, setKnowledge] = useState([]);
  const [filteredKnowledge, setFilteredKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [migrating, setMigrating] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'portfolio',
    category: 'other',
    tags: '',
    language: 'en'
  });

  const categories = ['personal', 'contact', 'skills', 'experience', 'education', 'certifications', 'projects', 'fun-facts', 'faq', 'other'];
  const types = ['portfolio', 'general', 'faq', 'custom'];

  useEffect(() => {
    loadKnowledge();
  }, []);

  useEffect(() => {
    filterKnowledgeList();
  }, [knowledge, searchQuery, filterCategory, filterLanguage]);

  const loadKnowledge = async () => {
    try {
      setLoading(true);
      const data = await getAllKnowledge();
      setKnowledge(data);
    } catch (error) {
      console.error('Error loading knowledge:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterKnowledgeList = () => {
    let filtered = knowledge;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // Language filter
    if (filterLanguage !== 'all') {
      filtered = filtered.filter(item => item.metadata.language === filterLanguage);
    }

    setFilteredKnowledge(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const knowledgeData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      if (editingItem) {
        await updateKnowledge(editingItem.id, knowledgeData);
      } else {
        await storeKnowledge(knowledgeData);
      }

      setShowModal(false);
      setEditingItem(null);
      resetForm();
      loadKnowledge();
    } catch (error) {
      console.error('Error saving knowledge:', error);
      alert('Failed to save knowledge. Please try again.');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      type: item.type,
      category: item.category,
      tags: item.metadata.tags.join(', '),
      language: item.metadata.language
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this knowledge entry?')) return;

    try {
      await deleteKnowledge(id);
      loadKnowledge();
    } catch (error) {
      console.error('Error deleting knowledge:', error);
      alert('Failed to delete knowledge. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'portfolio',
      category: 'other',
      tags: '',
      language: 'en'
    });
  };

  const handleMigrate = async () => {
    if (!confirm('This will migrate all existing data to the knowledge base. Continue?')) return;

    try {
      setMigrating(true);
      const results = await migrateAllLanguages();

      let message = `Migration complete!\nEN: ${results.en?.success?.length || 0} processed`;

      const skippedCount = results.en?.success?.filter(s => s.skipped).length || 0;
      const addedCount = (results.en?.success?.length || 0) - skippedCount;

      message += ` (${addedCount} added, ${skippedCount} skipped)`;

      if (results.en?.failed?.length > 0) {
        message += `, ${results.en?.failed?.length || 0} failed`;
        message += `\n\nFailed Items:\n${results.en.failed.map(f => `- ${f.title}: ${f.error}`).join('\n')}`;
      }

      if (results.id) {
        message += `\nID: ${results.id?.success?.length || 0} processed`;
      }

      alert(message);
      loadKnowledge();
    } catch (error) {
      console.error('Migration error:', error);
      alert('Migration failed. Check console for details.');
    } finally {
      setMigrating(false);
    }
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredKnowledge.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredKnowledge.map(item => item.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedItems.size} items?`)) return;

    try {
      setLoading(true);
      // Delete one by one since we don't have a bulk delete API yet
      await Promise.all(Array.from(selectedItems).map(id => deleteKnowledge(id)));

      setSelectedItems(new Set());
      loadKnowledge();
    } catch (error) {
      console.error('Error deleting items:', error);
      alert('Failed to delete some items.');
    } finally {
      setLoading(false);
    }
  };

  const exportKnowledge = () => {
    const dataStr = JSON.stringify(knowledge, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `knowledge-base-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="text-blue-500" />
            AI Knowledge Base
          </h1>
          <p className="text-gray-400 mt-1">
            Manage RAG knowledge entries ({knowledge.length} total)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedItems.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 size={18} />
              Delete ({selectedItems.size})
            </button>
          )}
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Upload size={18} />
            {migrating ? 'Migrating...' : 'Migrate'}
          </button>
          <button
            onClick={exportKnowledge}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download size={18} />
            Export
          </button>
          <button
            onClick={() => {
              resetForm();
              setEditingItem(null);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Add New
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <div className="text-blue-400 text-sm font-medium">Total Entries</div>
          <div className="text-2xl font-bold text-white mt-1">{knowledge.length}</div>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <div className="text-green-400 text-sm font-medium">English</div>
          <div className="text-2xl font-bold text-white mt-1">
            {knowledge.filter(k => k.metadata.language === 'en').length}
          </div>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <div className="text-purple-400 text-sm font-medium">Indonesian</div>
          <div className="text-2xl font-bold text-white mt-1">
            {knowledge.filter(k => k.metadata.language === 'id').length}
          </div>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <div className="text-orange-400 text-sm font-medium">Categories</div>
          <div className="text-2xl font-bold text-white mt-1">
            {new Set(knowledge.map(k => k.category)).size}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search knowledge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 focus:outline-none"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white focus:outline-none"
          >
            <option value="all">All Languages</option>
            <option value="en">English</option>
            <option value="id">Indonesian</option>
          </select>
        </div>
      </div>

      {/* Knowledge List */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-900 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredKnowledge.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
          <Database className="mx-auto text-gray-600 mb-4" size={48} />
          <h3 className="text-xl font-medium text-white mb-2">No entries found</h3>
          <p className="text-gray-400 mb-4">Add knowledge to train your AI assistant</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Plus size={18} /> Add First Entry
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="flex items-center gap-3 px-2">
            <input
              type="checkbox"
              checked={filteredKnowledge.length > 0 && selectedItems.size === filteredKnowledge.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
            />
            <span className="text-sm text-gray-400">
              Select All ({filteredKnowledge.length} items)
            </span>
          </div>
          {filteredKnowledge.map((item) => (
            <div
              key={item.id}
              className={`bg-gray-900 p-4 rounded-xl border transition-all ${selectedItems.has(item.id)
                ? 'border-blue-500/50 bg-blue-500/5'
                : 'border-gray-800 hover:border-gray-700'
                }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {item.title}
                    </h3>
                    <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
                      {item.category}
                    </span>
                    <span className="px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded">
                      {item.metadata.language.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-gray-400 text-sm line-clamp-2 mb-3 prose prose-invert prose-sm max-w-none prose-p:my-0 prose-headings:my-0">
                    <ReactMarkdown>{item.content}</ReactMarkdown>
                  </div>
                  {item.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.metadata.tags.slice(0, 5).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-xs bg-gray-800 text-gray-500 rounded border border-gray-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingItem ? 'Edit Knowledge' : 'Add Knowledge'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="E.g., React Development Skills"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content * (Markdown supported)
                  </label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Detailed information about this topic..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {types.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Language
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="en">English</option>
                      <option value="id">Indonesian</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="react, frontend, skills"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                  >
                    <Save size={18} />
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Knowledge;
