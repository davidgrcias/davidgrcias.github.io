/**
 * OS Utilities
 * Helper functions for the WebOS
 */

/**
 * Clamp a value between min and max
 */
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Check if a point is near an edge (for snap zones)
 */
export const isNearEdge = (position, edgePosition, threshold = 20) => {
  return Math.abs(position - edgePosition) < threshold;
};

/**
 * Get snap position based on proximity to edges
 */
export const getSnapPosition = (x, y, windowWidth, windowHeight, screenWidth, screenHeight) => {
  const snapThreshold = 30;
  
  // Top edge - maximize
  if (y < snapThreshold) {
    return {
      x: 0,
      y: 0,
      width: screenWidth,
      height: screenHeight - 70, // Account for taskbar
      snapped: 'maximized',
    };
  }
  
  // Left edge - snap left half
  if (x < snapThreshold) {
    return {
      x: 0,
      y: 0,
      width: screenWidth / 2,
      height: screenHeight - 70,
      snapped: 'left',
    };
  }
  
  // Right edge - snap right half
  if (x + windowWidth > screenWidth - snapThreshold) {
    return {
      x: screenWidth / 2,
      y: 0,
      width: screenWidth / 2,
      height: screenHeight - 70,
      snapped: 'right',
    };
  }
  
  return null;
};

/**
 * Generate a unique window ID
 */
export const generateWindowId = () => {
  return `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Check if reduced motion is preferred
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get time-based greeting
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};
