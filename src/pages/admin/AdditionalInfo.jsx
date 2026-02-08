import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Info, Sparkles } from 'lucide-react';
import { getCollection, setDocument, deleteDocument } from '../../services/firestore';
import { toast } from 'react-hot-toast';

const AdditionalInfo = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [formData, setFormData] = useState({
    categoryName: '',
    items: []
  });
  const [itemFormData, setItemFormData] = useState({
    label: '',
    value: '',
    context: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getCollection('additionalInfo', { orderByField: 'order' });
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading additional info:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setEditingItem(null);
    setShowItemForm(false);
    setFormData({ categoryName: '', items: [] });
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditingItem(null);
    setShowItemForm(false);
    setFormData({
      categoryName: category.category,
      items: category.items || []
    });
    setShowModal(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category and all its items?')) return;
    
    try {
      await deleteDocument('additionalInfo', id);
      toast.success('Category deleted!');
      loadData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setItemFormData({ label: '', value: '', context: '' });
    setShowItemForm(true);
  };

  const handleEditItem = (index) => {
    setEditingItem(index);
    setItemFormData(formData.items[index]);
    setShowItemForm(true);
  };

  const handleSaveItem = () => {
    const newItems = [...formData.items];
    if (editingItem !== null) {
      newItems[editingItem] = itemFormData;
    } else {
      newItems.push(itemFormData);
    }
    setFormData({ ...formData, items: newItems });
    setItemFormData({ label: '', value: '', context: '' });
    setEditingItem(null);
    setShowItemForm(false);
  };

  const handleDeleteItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('Add at least one item');
      return;
    }

    try {
      const data = {
        category: formData.categoryName,
        items: formData.items,
        order: editingCategory?.order || Date.now(),
        updatedAt: new Date()
      };

      if (editingCategory) {
        await setDocument('additionalInfo', editingCategory.id, data);
        toast.success('Category updated!');
      } else {
        await setDocument('additionalInfo', `cat_${Date.now()}`, data);
        toast.success('Category created!');
      }

      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Additional Personal Info</h1>
              <p className="text-zinc-400">
                Extra personal details for the AI chatbot (height, music taste, hobbies, etc.)
              </p>
            </div>
            <button
              onClick={handleAddCategory}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus size={20} />
              Add Category
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="text-blue-400 mt-0.5 shrink-0" />
            <div className="text-sm text-zinc-300">
              <p className="mb-2">
                This data is injected into the AI chatbot's prompt to answer personal questions about you.
              </p>
              <p className="text-zinc-400 text-xs">
                Changes here sync with <code className="px-1 py-0.5 bg-zinc-800 rounded font-mono text-blue-400">src/data/additionalInfo.js</code> via Firestore.
              </p>
            </div>
          </div>
        </div>

        {/* Categories List */}
        {categories.length === 0 ? (
          <div className="text-center py-12 bg-zinc-800/50 border border-zinc-700 rounded-xl">
            <Info size={48} className="mx-auto text-zinc-600 mb-4" />
            <p className="text-zinc-400 mb-4">No categories yet. Add your first one!</p>
            <button
              onClick={handleAddCategory}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus size={20} />
              Add Category
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">{category.category}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {(category.items || []).map((item, index) => (
                    <div key={index} className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white">{item.label}</span>
                            <span className="text-zinc-600">•</span>
                            <span className="text-zinc-400 text-sm">{item.value}</span>
                          </div>
                          <p className="text-zinc-500 text-sm">{item.context}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Item Count */}
                <div className="mt-3 text-xs text-zinc-500">
                  {category.items?.length || 0} item{category.items?.length !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-700">
                  <h2 className="text-xl font-semibold text-white">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Category Name */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.categoryName}
                      onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                      className="w-full px-4 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="E.g., Physical & Personal, Music & Entertainment"
                    />
                  </div>

                  {/* Items Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-zinc-300">Items</label>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                        <Plus size={16} />
                        Add Item
                      </button>
                    </div>

                    {/* Item Form (when adding/editing) */}
                    {showItemForm && (
                      <div className="bg-zinc-900 border border-zinc-600 rounded-lg p-4 mb-3">
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={itemFormData.label}
                            onChange={(e) => setItemFormData({ ...itemFormData, label: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white text-sm"
                            placeholder="Label (e.g., Height, Favorite Music)"
                          />
                          <input
                            type="text"
                            value={itemFormData.value}
                            onChange={(e) => setItemFormData({ ...itemFormData, value: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white text-sm"
                            placeholder="Short Value (e.g., 175 cm, J-Pop)"
                          />
                          <textarea
                            value={itemFormData.context}
                            onChange={(e) => setItemFormData({ ...itemFormData, context: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-white text-sm"
                            placeholder="Full Context for AI (e.g., David is 175cm tall and athletic build)"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleSaveItem}
                              disabled={!itemFormData.label || !itemFormData.context}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white text-sm rounded transition-colors"
                            >
                              <Save size={14} />
                              Save Item
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setItemFormData({ label: '', value: '', context: '' });
                                setEditingItem(null);
                                setShowItemForm(false);
                              }}
                              className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-2">
                      {formData.items.map((item, index) => (
                        <div key={index} className="bg-zinc-900/50 border border-zinc-600 rounded-lg p-3 flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-white text-sm">{item.label}</span>
                              {item.value && (
                                <>
                                  <span className="text-zinc-600">•</span>
                                  <span className="text-zinc-400 text-xs">{item.value}</span>
                                </>
                              )}
                            </div>
                            <p className="text-zinc-500 text-xs">{item.context}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditItem(index)}
                              className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(index)}
                              className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {formData.items.length === 0 && (
                        <p className="text-center text-zinc-500 text-sm py-4">No items yet. Add one above!</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Save size={18} />
                    {editingCategory ? 'Update' : 'Create'} Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalInfo;
