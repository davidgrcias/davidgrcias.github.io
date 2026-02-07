import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useSound } from './SoundContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

/**
 * Notification Provider
 * Global notification system for the OS
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const recentNotificationsRef = React.useRef(new Set());
  const { playNotification, playError } = useSound();

  const showNotification = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    // Deduplication - prevent same notification within 2 seconds
    const notificationKey = `${title}-${message}`;
    if (recentNotificationsRef.current.has(notificationKey)) {
      return null;
    }
    
    const id = Date.now() + Math.random();
    
    const notification = {
      id,
      title,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration,
    };

    // Play appropriate sound
    if (type === 'error') {
      playError();
    } else {
      playNotification();
    }

    setNotifications(prev => {
      // Dynamic Island style: Only show ONE notification at a time (replace current)
      // This prevents the "stacking" look which doesn't fit the island aesthetic
      return [notification];
    });

    // Add to recent notifications for deduplication
    recentNotificationsRef.current.add(notificationKey);
    setTimeout(() => {
      recentNotificationsRef.current.delete(notificationKey);
    }, 2000);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, removeNotification }}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
};

/**
 * Notification Container
 * Renders notifications in a stack at top-center (Dynamic Island style)
 */
const NotificationContainer = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[10001] pointer-events-none flex flex-col items-center gap-2">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            notification={notification}
            onClose={() => onRemove(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * Individual Notification
 * dynamic-island pill style
 */
const Notification = ({ notification, onClose }) => {
  const icons = {
    success: <CheckCircle size={14} className="text-green-400" />,
    error: <AlertCircle size={14} className="text-red-400" />,
    warning: <AlertTriangle size={14} className="text-yellow-400" />,
    info: <Info size={14} className="text-blue-400" />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 25, stiffness: 400 }}
      onClick={onClose}
      className="pointer-events-auto flex items-center gap-3 pl-3 pr-4 py-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl hover:bg-black/90 transition-colors cursor-pointer group min-w-[200px] max-w-[90vw]"
    >
      {/* Icon Bubble */}
      <div className={`flex items-center justify-center w-6 h-6 rounded-full bg-white/10 ${
        notification.type === 'success' ? 'text-green-400' : 
        notification.type === 'error' ? 'text-red-400' : 
        notification.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
      }`}>
        {icons[notification.type]}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0 mr-2">
        <span className="text-sm font-medium text-white leading-none mb-0.5">
          {notification.title}
        </span>
        {notification.message && (
          <span className="text-[11px] text-white/50 leading-tight truncate max-w-[200px]">
            {notification.message}
          </span>
        )}
      </div>

      {/* Close Hint (Visible on hover) */}
      <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <X size={10} className="text-white/70" />
      </div>
    </motion.div>
  );
};

export default NotificationProvider;
