import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import {
  BookOpen, Clock, Calendar, Search, Filter, ArrowLeft,
  ExternalLink, Loader2, Tag, ChevronRight, Sparkles,
  Grid3X3, List, X, RefreshCw, Share2, Check
} from 'lucide-react';
import { getPosts, getCategories, getPostById } from '../../data/posts';
import { useOS } from '../../contexts/OSContext';
import { toast } from 'react-hot-toast';
import OptimizedImage from '../../components/common/OptimizedImage';

/**
 * Blog App
 * Full blog viewer with posts grid, category filter, and post detail view
 */
const BlogApp = ({ id }) => {
  const { updateWindow } = useOS();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const markdownComponents = {
    h1: (props) => <h1 className="text-xl font-bold mt-6 mb-3 text-white" {...props} />,
    h2: (props) => <h2 className="text-lg font-semibold mt-5 mb-2 text-cyan-400" {...props} />,
    h3: (props) => <h3 className="text-base font-medium mt-4 mb-2 text-white/90" {...props} />,
    p: (props) => <p className="text-white/70 mb-2 leading-relaxed" {...props} />,
    ul: (props) => <ul className="list-disc pl-5 text-white/70 space-y-1" {...props} />,
    ol: (props) => <ol className="list-decimal pl-5 text-white/70 space-y-1" {...props} />,
    li: (props) => <li className="text-white/70" {...props} />,
    a: (props) => (
      <a className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
    ),
    blockquote: (props) => (
      <blockquote className="border-l-2 border-cyan-500/40 pl-4 text-white/70 italic" {...props} />
    ),
    pre: (props) => (
      <pre className="bg-zinc-950/60 border border-white/10 rounded-lg p-3 overflow-auto" {...props} />
    ),
    code: ({ inline, children, ...props }) =>
      inline ? (
        <code className="px-1 py-0.5 rounded bg-white/10 text-white/90" {...props}>
          {children}
        </code>
      ) : (
        <code className="text-xs text-white/80" {...props}>
          {children}
        </code>
      ),
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [postsData, categoriesData] = await Promise.all([
        getPosts(),
        getCategories()
      ]);
      setPosts(postsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Context Menu & External Actions
  useEffect(() => {
    if (id) {
      updateWindow(id, {
        contextMenuOptions: [
          {
            label: 'Refresh Posts',
            icon: <RefreshCw size={16} />,
            onClick: loadData,
            shortcut: 'F5',
          },
          { separator: true },
          {
            label: 'Share Blog',
            icon: <Share2 size={16} />,
            onClick: () => navigator.clipboard.writeText(window.location.origin),
          }
        ]
      });
    }
  }, [id, updateWindow]);

  // Listen for external actions
  useEffect(() => {
    const handleAction = (e) => {
      const { appId, action } = e.detail;
      if (appId !== 'blog') return;

      if (action === 'refresh') loadData();
      if (action === 'share') navigator.clipboard.writeText(window.location.origin);
    };

    window.addEventListener('WEBOS_APP_ACTION', handleAction);
    return () => window.removeEventListener('WEBOS_APP_ACTION', handleAction);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handlePostClick = (post) => {
    // Always open in-app view first (no auto-redirect)
    setSelectedPost(post);
  };

  const handleShare = async (post) => {
    const shareData = {
      title: post.title,
      text: post.excerpt,
      url: post.externalLink || window.location.href
    };

    try {
      // Try Web Share API first (mobile/modern browsers)
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Shared successfully!', {
          duration: 2000,
          position: 'bottom-center',
          style: {
            background: '#10b981',
            color: '#fff',
          }
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard!', {
          duration: 2000,
          position: 'bottom-center',
          style: {
            background: '#10b981',
            color: '#fff',
          }
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to share', {
        duration: 2000,
        position: 'bottom-center',
        style: {
          background: '#ef4444',
          color: '#fff',
        }
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-900">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  // Post Detail View
  if (selectedPost) {
    return (
      <div className="h-full flex flex-col bg-zinc-900 text-white overflow-hidden">
        <Helmet>
          <title>{selectedPost.title} | David Garcia</title>
          <meta name="description" content={selectedPost.excerpt} />
          <meta property="og:title" content={selectedPost.title} />
          <meta property="og:description" content={selectedPost.excerpt} />
          {selectedPost.image && <meta property="og:image" content={selectedPost.image} />}
          <meta property="og:type" content="article" />
        </Helmet>

        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-zinc-900/80 backdrop-blur-sm">
          <motion.button
            onClick={() => setSelectedPost(null)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div className="flex-1">
            <h2 className="font-semibold text-sm truncate">{selectedPost.title}</h2>
            <div className="flex items-center gap-3 text-xs text-white/50 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(selectedPost.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {selectedPost.readTime} min read
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => handleShare(selectedPost)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-purple-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Share this post"
            >
              <Share2 size={18} />
            </motion.button>
            {selectedPost.externalLink && (
              <motion.button
                onClick={() => window.open(selectedPost.externalLink, '_blank')}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-cyan-400"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="View original post"
              >
                <ExternalLink size={18} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero Image / Gallery Grid */}
          {(() => {
            // Combine all images (cover + gallery)
            const allImages = [
              ...(selectedPost.image ? [selectedPost.image] : []),
              ...(selectedPost.images || [])
            ];

            if (allImages.length === 0) return null;

            if (allImages.length === 1) {
              return (
                <div className="relative h-48 sm:h-64">
                  <OptimizedImage
                    src={allImages[0]}
                    alt={selectedPost.title}
                    width={800}
                    quality={85}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                  {/* Category Badge */}
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-medium">
                      {selectedPost.category}
                    </span>
                  </div>
                </div>
              );
            }

            // Multi-image Grid
            // Dynamic Grid Configuration
            const isFourOrMore = allImages.length >= 4;
            const gridColsClass = isFourOrMore ? 'grid-cols-3' : 'grid-cols-2';

            return (
              <div className="p-4 pb-0">
                <div className={`grid ${gridColsClass} grid-rows-2 gap-1 rounded-xl overflow-hidden aspect-video sm:aspect-[2/1]`}>
                  {/* Image 1: Always Main/Top */}
                  {/* If only 2 images, it's side by side, so no row spanning logic needed, just 1 col each if we didn't force rows-2 */}
                  {/* Wait, for 2 images, we want side-by-side full height. 
                      For 3+: 2 rows. 
                      Let's split logic more clearly.
                  */}

                  {allImages.length === 2 ? (
                    // 2 Images: Side by Side (Implicit 1 row, but container has aspect ratio)
                    // To fill height, we can unset grid-rows-2 or just let them span row-span-2
                    <>
                      <div className="relative col-span-1 row-span-2 h-full">
                        <OptimizedImage src={allImages[0]} width={600} quality={85} className="w-full h-full object-cover" alt={`${selectedPost.title} - Image 1`} />
                      </div>
                      <div className="relative col-span-1 row-span-2 h-full">
                        <OptimizedImage src={allImages[1]} width={600} quality={85} className="w-full h-full object-cover" alt={`${selectedPost.title} - Image 2`} />
                      </div>
                    </>
                  ) : (
                    // 3 or 4+ Images: Top Heavy
                    <>
                      {/* Main Image (Top) */}
                      <div className={`relative ${isFourOrMore ? 'col-span-3' : 'col-span-2'} row-span-1 h-full`}>
                        <OptimizedImage src={allImages[0]} width={800} quality={85} className="w-full h-full object-cover" alt={selectedPost.title} />
                      </div>

                      {/* Sub Images (Bottom Row) */}
                      {allImages.slice(1, 4).map((img, idx) => (
                        <div key={idx} className="relative col-span-1 row-span-1 h-full">
                          <OptimizedImage src={img} width={400} quality={80} className="w-full h-full object-cover" alt={`${selectedPost.title} - Image ${idx + 2}`} />
                          {/* Overlay on last item if there are more than 4 */}
                          {idx === 2 && allImages.length > 4 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xl font-bold">
                              +{allImages.length - 4}
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-medium">
                    {selectedPost.category}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Article Content */}
          <div className="p-6">
            <h1 className="text-xl sm:text-2xl font-bold mb-4">{selectedPost.title}</h1>

            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown components={markdownComponents}>
                {selectedPost.content}
              </ReactMarkdown>
            </div>

            {/* External Link Button */}
            {selectedPost.externalLink && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <a
                  href={selectedPost.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all font-medium group"
                >
                  Read Original Post
                  <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <p className="text-center sm:text-left text-xs text-white/40 mt-3">
                  This post was originally published on an external platform. Click above to view the full verified source.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Posts Grid View
  return (
    <div className="h-full flex flex-col bg-zinc-900 text-white overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-purple-400" />
            <h1 className="font-bold text-lg">Blog</h1>
            <span className="text-xs text-white/40 ml-2">{posts.length} posts</span>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-cyan-400' : 'text-white/50 hover:text-white'}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-white/10 text-cyan-400' : 'text-white/50 hover:text-white'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(cat => (
            <motion.button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Posts Grid/List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/40">
            <Search size={48} className="mb-4 opacity-50" />
            <p>No posts found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                onClick={() => handlePostClick(post)}
                className="group cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                {/* Thumbnail */}
                <div className="relative h-32 overflow-hidden">
                  <OptimizedImage
                    src={post.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80'}
                    alt={post.title}
                    width={800}
                    quality={85}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />

                  {/* Featured Badge */}
                  {post.featured && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                      <Sparkles size={10} className="text-yellow-400" />
                      <span className="text-[9px] font-medium text-yellow-400">FEATURED</span>
                    </div>
                  )}

                  {/* Category */}
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-medium">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1 group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-white/50 line-clamp-2 mb-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-[10px] text-white/40">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {formatDate(post.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {post.readTime} min
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-2">
            {filteredPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                onClick={() => handlePostClick(post)}
                className="group flex gap-4 p-3 cursor-pointer rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                whileHover={{ x: 4 }}
              >
                {/* Thumbnail */}
                <div className="relative w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                  <OptimizedImage
                    src={post.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80'}
                    alt={post.title}
                    width={400}
                    quality={85}
                    className="w-full h-full object-cover"
                  />
                  {post.featured && (
                    <div className="absolute top-1 right-1">
                      <Sparkles size={12} className="text-yellow-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-[10px] font-medium">
                      {post.category}
                    </span>
                    <span className="text-[10px] text-white/40 flex items-center gap-1">
                      <Clock size={10} />
                      {post.readTime} min
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm group-hover:text-cyan-400 transition-colors line-clamp-1">
                    {post.title}
                  </h3>
                  <p className="text-xs text-white/50 line-clamp-1">{post.excerpt}</p>
                  <span className="text-[10px] text-white/30 mt-1 block">{formatDate(post.date)}</span>
                </div>

                <ChevronRight size={16} className="text-white/30 group-hover:text-cyan-400 self-center transition-colors" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogApp;
