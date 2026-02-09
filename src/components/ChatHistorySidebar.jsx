import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  Trash2,
  Clock,
  Bot,
  User,
  Users,
  Heart,
  GraduationCap,
  ChevronLeft,
  MessageCircle,
} from 'lucide-react';

// ============================================================
// Persona icon mapping (matches ChatBot persona definitions)
// ============================================================
const PERSONA_ICONS = {
  assistant: <Bot size={14} />,
  david: <User size={14} />,
  bestfriend: <Users size={14} />,
  girlfriend: <Heart size={14} />,
  teacher: <GraduationCap size={14} />,
};

const PERSONA_LABELS = {
  assistant: 'Assistant',
  david: 'David',
  bestfriend: 'Best Friend',
  girlfriend: 'Girlfriend',
  teacher: 'Professor',
};

// ============================================================
// Utility: Relative time formatting
// ============================================================
const formatRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ============================================================
// Main Component
// ============================================================
const ChatHistorySidebar = ({
  isOpen,
  onClose,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isLoading = false,
  isFullscreen = false,
}) => {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const sidebarRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset confirm state when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      setConfirmDeleteId(null);
      setDeletingId(null);
    }
  }, [isOpen]);

  // ============================================================
  // Delete handler with confirmation
  // ============================================================
  const handleDelete = async (e, conversationId) => {
    e.stopPropagation();

    if (confirmDeleteId === conversationId) {
      // Second click = confirm delete
      setDeletingId(conversationId);
      try {
        await onDeleteConversation(conversationId);
      } finally {
        setDeletingId(null);
        setConfirmDeleteId(null);
      }
    } else {
      // First click = show confirm state
      setConfirmDeleteId(conversationId);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmDeleteId((prev) => (prev === conversationId ? null : prev)), 3000);
    }
  };

  // ============================================================
  // Get message preview (last user message or first bot message)
  // ============================================================
  const getPreview = (messages) => {
    if (!messages || messages.length === 0) return 'Empty conversation';
    // Show last message as preview
    const lastMsg = messages[messages.length - 1];
    const text = lastMsg?.content || '';
    return text.length > 60 ? text.substring(0, 60) + '…' : text;
  };

  const getMessageCount = (messages) => {
    if (!messages) return 0;
    return messages.filter((m) => m.type === 'user').length;
  };

  // ============================================================
  // Sidebar animation variants
  // ============================================================
  const sidebarVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
    exit: {
      x: '-100%',
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeInOut' },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.08, duration: 0.3, ease: 'easeOut' },
    }),
    exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-10 rounded-2xl"
          />

          {/* Sidebar panel */}
          <motion.div
            ref={sidebarRef}
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`absolute left-0 top-0 bottom-0 z-20 flex flex-col
              bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
              shadow-2xl rounded-l-2xl overflow-hidden
              ${isFullscreen ? 'w-72' : 'w-64'}
            `}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-cyan-500 to-blue-500">
              <div className="flex items-center gap-2 text-white">
                <Clock size={18} />
                <h4 className="font-semibold text-sm">Chat History</h4>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
                title="Close history"
              >
                <ChevronLeft size={18} />
              </button>
            </div>

            {/* New Chat Button */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-700/50">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onNewChat();
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl
                  bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium
                  hover:from-cyan-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
              >
                <Plus size={16} />
                <span>New Chat</span>
              </motion.button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
              {isLoading ? (
                // Loading skeleton
                <div className="space-y-2 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
                  <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
                    <MessageCircle size={24} className="text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No conversations yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Start chatting and your history will appear here
                  </p>
                </div>
              ) : (
                // Conversation cards
                <AnimatePresence mode="popLayout">
                  {conversations.map((convo, index) => {
                    const isActive = convo.id === activeConversationId;
                    const isConfirmingDelete = confirmDeleteId === convo.id;
                    const isDeleting = deletingId === convo.id;

                    return (
                      <motion.div
                        key={convo.id}
                        custom={index}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        onClick={() => {
                          onSelectConversation(convo.id);
                          onClose();
                        }}
                        className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200
                          ${isActive
                            ? 'bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 shadow-sm'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent'
                          }
                          ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
                        `}
                      >
                        {/* Title row */}
                        <div className="flex items-start gap-2 mb-1">
                          <span className="flex-shrink-0 mt-0.5 text-cyan-500 dark:text-cyan-400">
                            {PERSONA_ICONS[convo.persona] || PERSONA_ICONS.assistant}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              isActive
                                ? 'text-cyan-700 dark:text-cyan-300'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}>
                              {convo.title || 'New Chat'}
                            </p>
                          </div>

                          {/* Delete button */}
                          <button
                            onClick={(e) => handleDelete(e, convo.id)}
                            className={`flex-shrink-0 p-1 rounded-md transition-all duration-200
                              ${isConfirmingDelete
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-500 opacity-100'
                                : 'opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500'
                              }
                            `}
                            title={isConfirmingDelete ? 'Click again to confirm' : 'Delete conversation'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Preview + metadata */}
                        <div className="ml-6">
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate leading-relaxed">
                            {getPreview(convo.messages)}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              {formatRelativeTime(convo.updatedAt)}
                            </span>
                            <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              {getMessageCount(convo.messages)} {getMessageCount(convo.messages) === 1 ? 'msg' : 'msgs'}
                            </span>
                            <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                              {PERSONA_LABELS[convo.persona] || 'Assistant'}
                            </span>
                          </div>
                        </div>

                        {/* Active indicator bar */}
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-cyan-500"
                          />
                        )}

                        {/* Confirm delete tooltip */}
                        <AnimatePresence>
                          {isConfirmingDelete && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="absolute -top-7 right-2 px-2 py-1 bg-red-500 text-white text-[10px] rounded-md shadow-lg whitespace-nowrap z-30"
                            >
                              Click again to delete
                              <div className="absolute -bottom-1 right-3 w-2 h-2 bg-red-500 rotate-45" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer info */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-700/50">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
                {conversations.length}/{3} conversations stored
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatHistorySidebar;
