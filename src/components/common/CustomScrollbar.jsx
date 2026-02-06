import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';

/**
 * CustomScrollbar - A cross-browser consistent scrollbar component
 * Renders identically on Chrome, Firefox, Edge, Brave, Safari
 * 
 * Usage:
 * <CustomScrollbar className="your-container-class">
 *   {children}
 * </CustomScrollbar>
 */
const CustomScrollbar = ({ 
  children, 
  className = '', 
  style = {},
  thumbColor = 'rgba(139, 92, 246, 0.6)',
  thumbHoverColor = 'rgba(139, 92, 246, 0.9)',
  trackColor = 'rgba(30, 41, 59, 0.3)',
  thumbWidth = 2,
  autoHide = true,
  scrollThreshold = 5,
  autoHideDelay = 1500,
}) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const thumbRef = useRef(null);
  
  const [isScrollable, setIsScrollable] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const scrollTop = useMotionValue(0);
  const thumbY = useSpring(0, { stiffness: 300, damping: 30 });
  const thumbHeight = useRef(0);
  const contentHeight = useRef(0);
  const containerHeight = useRef(0);
  
  const hideTimeout = useRef(null);
  const dragStartY = useRef(0);
  const dragStartScrollTop = useRef(0);

  // Calculate scrollbar dimensions with threshold to prevent ghost scrollbar
  const updateDimensions = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;
    
    const container = containerRef.current;
    const content = contentRef.current;
    
    containerHeight.current = container.clientHeight;
    contentHeight.current = content.scrollHeight;
    
    // Add threshold buffer - only show scrollbar if content truly exceeds container
    const scrollableHeight = contentHeight.current - containerHeight.current;
    setIsScrollable(scrollableHeight > scrollThreshold);
    
    if (scrollableHeight > scrollThreshold) {
      // Thumb height is proportional to visible area
      const ratio = containerHeight.current / contentHeight.current;
      thumbHeight.current = Math.max(20, containerHeight.current * ratio);
    }
  }, [scrollThreshold]);

  // Update thumb position based on scroll
  const updateThumbPosition = useCallback(() => {
    if (!containerRef.current || !isScrollable) return;
    
    const container = containerRef.current;
    const scrollableHeight = contentHeight.current - containerHeight.current;
    const trackHeight = containerHeight.current - thumbHeight.current - 8; // 8px padding
    
    const scrollRatio = container.scrollTop / scrollableHeight;
    const newThumbY = 4 + scrollRatio * trackHeight; // 4px top padding
    
    thumbY.set(newThumbY);
    scrollTop.set(container.scrollTop);
  }, [isScrollable, thumbY, scrollTop]);

  // Handle wheel scroll
  const handleWheel = useCallback((e) => {
    if (!containerRef.current || !isScrollable) return;
    
    e.preventDefault();
    const container = containerRef.current;
    const scrollableHeight = contentHeight.current - containerHeight.current;
    
    const delta = e.deltaY;
    const newScrollTop = Math.max(0, Math.min(scrollableHeight, container.scrollTop + delta));
    
    // Smooth scroll animation
    animate(container.scrollTop, newScrollTop, {
      duration: 0.15,
      ease: 'easeOut',
      onUpdate: (value) => {
        container.scrollTop = value;
        updateThumbPosition();
      }
    });
    
    // Show scrollbar
    showScrollbar();
  }, [isScrollable, updateThumbPosition]);

  // Show scrollbar with auto-hide
  const showScrollbar = useCallback(() => {
    setIsVisible(true);
    
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }
    
    if (autoHide && !isDragging && !isHovering) {
      hideTimeout.current = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);
    }
  }, [autoHide, autoHideDelay, isDragging, isHovering]);

  // Handle thumb drag start
  const handleThumbMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartScrollTop.current = containerRef.current?.scrollTop || 0;
    
    document.addEventListener('mousemove', handleThumbMouseMove);
    document.addEventListener('mouseup', handleThumbMouseUp);
  }, []);

  // Handle thumb drag move
  const handleThumbMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    
    const deltaY = e.clientY - dragStartY.current;
    const trackHeight = containerHeight.current - thumbHeight.current - 8;
    const scrollableHeight = contentHeight.current - containerHeight.current;
    
    const scrollDelta = (deltaY / trackHeight) * scrollableHeight;
    const newScrollTop = Math.max(0, Math.min(scrollableHeight, dragStartScrollTop.current + scrollDelta));
    
    containerRef.current.scrollTop = newScrollTop;
    updateThumbPosition();
  }, [updateThumbPosition]);

  // Handle thumb drag end
  const handleThumbMouseUp = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleThumbMouseMove);
    document.removeEventListener('mouseup', handleThumbMouseUp);
    
    if (autoHide) {
      hideTimeout.current = setTimeout(() => {
        if (!isHovering) setIsVisible(false);
      }, autoHideDelay);
    }
  }, [autoHide, autoHideDelay, isHovering, handleThumbMouseMove]);

  // Handle track click to jump
  const handleTrackClick = useCallback((e) => {
    if (!containerRef.current || e.target === thumbRef.current) return;
    
    const trackRect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - trackRect.top;
    const trackHeight = containerHeight.current - 8;
    const scrollableHeight = contentHeight.current - containerHeight.current;
    
    const scrollRatio = (clickY - thumbHeight.current / 2) / (trackHeight - thumbHeight.current);
    const newScrollTop = Math.max(0, Math.min(scrollableHeight, scrollRatio * scrollableHeight));
    
    animate(containerRef.current.scrollTop, newScrollTop, {
      duration: 0.3,
      ease: 'easeOut',
      onUpdate: (value) => {
        if (containerRef.current) {
          containerRef.current.scrollTop = value;
          updateThumbPosition();
        }
      }
    });
  }, [updateThumbPosition]);

  // Setup resize observer
  useEffect(() => {
    updateDimensions();
    
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
      updateThumbPosition();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, [updateDimensions, updateThumbPosition]);

  // Native scroll event listener (for touch/keyboard)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      updateThumbPosition();
      showScrollbar();
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [updateThumbPosition, showScrollbar]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, []);

  const shouldShowScrollbar = isScrollable && (isVisible || isHovering || isDragging || !autoHide);

  return (
    <div 
      className={`relative ${className}`}
      style={{ ...style, overflow: 'hidden' }}
      onMouseEnter={() => {
        setIsHovering(true);
        if (isScrollable) setIsVisible(true);
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        if (autoHide && !isDragging) {
          hideTimeout.current = setTimeout(() => setIsVisible(false), autoHideDelay);
        }
      }}
    >
      {/* Scrollable Content Container */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-scroll scrollbar-hide"
        onWheel={handleWheel}
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          paddingRight: isScrollable ? thumbWidth + 8 : 0 
        }}
      >
        <div ref={contentRef}>
          {children}
        </div>
      </div>

      {/* Custom Scrollbar Track */}
      <motion.div
        className="absolute top-0 bottom-0 right-0 cursor-pointer"
        style={{ 
          width: thumbWidth + 1,
          background: 'transparent',
        }}
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: shouldShowScrollbar ? 1 : 0,
          width: (isHovering || isDragging) ? thumbWidth + 2 : thumbWidth + 1
        }}
        transition={{ duration: 0.12 }}
        onClick={handleTrackClick}
      >
        {/* Track Background - only visible on hover */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: trackColor }}
          animate={{ opacity: (isHovering || isDragging) ? 1 : 0.3 }}
          transition={{ duration: 0.15 }}
        />
        
        {/* Custom Scrollbar Thumb */}
        <motion.div
          ref={thumbRef}
          className="absolute rounded-full cursor-grab active:cursor-grabbing"
          style={{ 
            y: thumbY,
            height: thumbHeight.current,
            left: 0.5,
            right: 0.5,
            background: (isHovering || isDragging) ? thumbHoverColor : thumbColor,
          }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.85 }}
          onMouseDown={handleThumbMouseDown}
          transition={{ duration: 0.1 }}
        />
      </motion.div>
    </div>
  );
};

export default CustomScrollbar;
