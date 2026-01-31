import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, ArrowRight, Loader2, Calendar, Sparkles } from 'lucide-react';
import { getFeaturedPost } from '../../data/posts';

/**
 * Featured Post Widget
 * Shows the latest/featured blog post on desktop
 * Click to open Blog app
 */
const FeaturedPostWidget = ({ className = '', onOpenBlog }) => {
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const featuredPost = await getFeaturedPost();
        setPost(featuredPost);
      } catch (error) {
        console.error('Error loading featured post:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, []);

  // Loading state
  if (loading || !post) {
    return (
      <div className={`relative overflow-hidden rounded-2xl border border-white/10 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-20" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
        <div className="relative p-4 text-white flex items-center justify-center h-full min-h-[200px]">
          <Loader2 className="w-6 h-6 animate-spin text-white/50" />
        </div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl border border-white/10 cursor-pointer group ${className}`}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onOpenBlog}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {post.image && (
          <img 
            src={post.image} 
            alt={post.title}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-40 group-hover:opacity-50 group-hover:scale-105' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
      </div>

      {/* Content */}
      <div className="relative p-4 text-white h-full flex flex-col justify-end min-h-[180px]">
        {/* Featured Badge */}
        {post.featured && (
          <motion.div 
            className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles size={10} className="text-yellow-400" />
            <span className="text-[9px] font-medium text-yellow-400">FEATURED</span>
          </motion.div>
        )}

        {/* Category */}
        <div className="mb-2">
          <span className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold">
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-[11px] text-white/60 line-clamp-2 mb-3">
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] text-white/50">
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {post.readTime} min read
            </span>
          </div>
          
          {/* Read More */}
          <motion.div 
            className="flex items-center gap-1 text-cyan-400 text-[10px] font-medium"
            whileHover={{ x: 3 }}
          >
            <span>Read</span>
            <ArrowRight size={12} />
          </motion.div>
        </div>
      </div>

      {/* Hover Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent" />
      </div>
    </motion.div>
  );
};

export default FeaturedPostWidget;
