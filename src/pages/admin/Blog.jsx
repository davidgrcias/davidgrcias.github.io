import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Loader2, BookOpen, Calendar, Clock, Star, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { firestoreService } from '../../services/firestore';
import OptimizedImage from '../../components/common/OptimizedImage';
import MultiImageUploader from '../../components/admin/MultiImageUploader';
import ImageUploader from '../../components/admin/ImageUploader';
import { clearPostsCache } from '../../data/posts';

// Default posts for fallback
// Default posts for fallback
const defaultPosts = [];

const categoryOptions = ['Tech', 'Life', 'Tutorial', 'News', 'Personal'];

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.getCollection('posts', {
        orderByField: 'date',
        orderDirection: 'desc'
      });

      if (data && data.length > 0) {
        setPosts(data);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingPost({
      title: '',
      excerpt: '',
      content: '',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
      images: [],
      category: 'Tech',
      date: new Date().toISOString().split('T')[0],
      readTime: 5,
      featured: false,
      published: true,
      externalLink: '',
    });
    setIsEditing(true);
  };

  const handleEdit = (post) => {
    setEditingPost({ ...post });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await firestoreService.deleteDocument('posts', id);
      setPosts(posts.filter(p => p.id !== id));
      clearPostsCache(); // Clear cache so viewer sees changes
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    }
  };

  const handleSave = async () => {
    if (!editingPost.title.trim()) {
      alert('Please enter a title');
      return;
    }

    setSaving(true);
    try {
      const postData = {
        ...editingPost,
        externalLink: editingPost.externalLink?.trim() || null,
        readTime: parseInt(editingPost.readTime) || 5,
        updatedAt: new Date().toISOString()
      };

      if (editingPost.id) {
        // Update existing (use setDocument to handle upsert if it was a default post not yet in DB)
        await firestoreService.setDocument('posts', editingPost.id, postData);
        setPosts(posts.map(p => p.id === editingPost.id ? { ...p, ...postData } : p));
      } else {
        // Create new
        const newId = await firestoreService.addDocument('posts', {
          ...postData,
          createdAt: new Date().toISOString()
        });
        setPosts([{ ...postData, id: newId }, ...posts]);
      }

      setIsEditing(false);
      setEditingPost(null);
      clearPostsCache(); // Clear cache so viewer sees changes
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFeatured = async (post) => {
    try {
      // If setting as featured, unset other featured posts
      if (!post.featured) {
        const featuredPosts = posts.filter(p => p.featured && p.id !== post.id);
        for (const fp of featuredPosts) {
          await firestoreService.updateDocument('posts', fp.id, { featured: false });
        }
      }

      await firestoreService.updateDocument('posts', post.id, { featured: !post.featured });
      setPosts(posts.map(p => ({
        ...p,
        featured: p.id === post.id ? !post.featured : (post.featured ? p.featured : false)
      })));
    } catch (error) {
      console.error("Error toggling featured:", error);
    }
  };

  const handleTogglePublished = async (post) => {
    try {
      await firestoreService.updateDocument('posts', post.id, { published: !post.published });
      setPosts(posts.map(p => p.id === post.id ? { ...p, published: !post.published } : p));
    } catch (error) {
      console.error("Error toggling published:", error);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    );
  }

  // Edit Form
  if (isEditing) {
    return (
      <div className="space-y-6 pb-10 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {editingPost.id ? 'Edit Post' : 'New Post'}
            </h1>
            <p className="text-gray-400">Write your blog post content</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setIsEditing(false); setEditingPost(null); }}
              className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              Save Post
            </button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
              <input
                type="text"
                value={editingPost.title}
                onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white text-lg"
                placeholder="Enter post title..."
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Excerpt / Summary</label>
              <textarea
                value={editingPost.excerpt}
                onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white resize-none"
                placeholder="Brief summary shown in post list..."
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content (Markdown supported)
              </label>
              <textarea
                value={editingPost.content}
                onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                rows={15}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white resize-none font-mono text-sm"
                placeholder="# Your Post Title

Write your content here using Markdown...

## Section Heading

- Bullet point
- Another point

**Bold text** and *italic text*"
              />
            </div>

              {/* Meta Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Image Uploader */}
                <div>
                   <ImageUploader 
                     label="Cover Image"
                     initialImage={editingPost.image}
                     onImageUploaded={(url) => setEditingPost({ ...editingPost, image: url })}
                   />
                </div>

              {/* Multi Image Upload */}
              <div className="md:col-span-2">
                <MultiImageUploader
                  label="Gallery Images (Optional)"
                  initialImages={editingPost.images || []}
                  onImagesUploaded={(urls) => setEditingPost({ ...editingPost, images: urls })}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={editingPost.category}
                  onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                >
                  {categoryOptions.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Publish Date</label>
                <input
                  type="date"
                  value={editingPost.date}
                  onChange={(e) => setEditingPost({ ...editingPost, date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                />
              </div>

              {/* Read Time */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Read Time (minutes)</label>
                <input
                  type="number"
                  value={editingPost.readTime}
                  onChange={(e) => setEditingPost({ ...editingPost, readTime: e.target.value })}
                  min="1"
                  max="60"
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                />
              </div>
            </div>

            {/* External Link */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                External Link (optional)
              </label>
              <input
                type="url"
                value={editingPost.externalLink || ''}
                onChange={(e) => setEditingPost({ ...editingPost, externalLink: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
                placeholder="https://linkedin.com/posts/... (leave empty for in-app viewer)"
              />
              <p className="text-xs text-gray-500 mt-1">If set, clicking the post will open this link instead of the in-app reader</p>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-800">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingPost.featured}
                  onChange={(e) => setEditingPost({ ...editingPost, featured: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-300 flex items-center gap-2">
                  <Star size={16} className="text-yellow-400" />
                  Featured Post
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingPost.published}
                  onChange={(e) => setEditingPost({ ...editingPost, published: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-300 flex items-center gap-2">
                  <Eye size={16} className="text-green-400" />
                  Published
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Preview removed as ImageUploader handles it */ }
      </div>
    );
  }

  // Post List
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen size={24} />
            Blog Posts
          </h1>
          <p className="text-gray-400">{posts.length} posts total</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg transition-colors font-medium"
        >
          <Plus size={18} />
          New Post
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white focus:border-blue-500 outline-none"
        />
      </div>

      {/* Posts Grid */}
      <div className="grid gap-4">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors"
          >
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              {post.image && (
                <div className="md:w-48 h-32 md:h-auto flex-shrink-0">
                  <OptimizedImage
                    src={post.image}
                    alt={post.title}
                    width={200}
                    height={150}
                    quality={80}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
                        {post.category}
                      </span>
                      {post.featured && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                          <Star size={10} />
                          Featured
                        </span>
                      )}
                      {!post.published && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-500/20 text-gray-400 flex items-center gap-1">
                          <EyeOff size={10} />
                          Draft
                        </span>
                      )}
                      {post.externalLink && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                          <ExternalLink size={10} />
                          External
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-white mb-1">{post.title}</h3>

                    {/* Excerpt */}
                    <p className="text-sm text-gray-400 line-clamp-2 mb-2">{post.excerpt}</p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(post.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {post.readTime} min read
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFeatured(post)}
                      className={`p-2 rounded-lg transition-colors ${
                        post.featured
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-800 text-gray-500 hover:text-yellow-400'
                      }`}
                      title={post.featured ? 'Remove from featured' : 'Set as featured'}
                    >
                      <Star size={16} />
                    </button>
                    <button
                      onClick={() => handleTogglePublished(post)}
                      className={`p-2 rounded-lg transition-colors ${
                        post.published
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-800 text-gray-500 hover:text-green-400'
                      }`}
                      title={post.published ? 'Unpublish' : 'Publish'}
                    >
                      {post.published ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => handleEdit(post)}
                      className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p>No posts found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
