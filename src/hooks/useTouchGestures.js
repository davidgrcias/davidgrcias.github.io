import { useEffect, useRef } from 'react';

/**
 * useTouchGestures - Hook for handling touch gestures on mobile
 * Supports: swipe, pinch, long press
 */
export const useTouchGestures = ({ 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp, 
  onSwipeDown,
  onPinchIn,
  onPinchOut,
  onLongPress,
  enabled = true,
  threshold = 50, // minimum distance for swipe
  longPressDelay = 500 // ms for long press
}) => {
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);
  const initialDistanceRef = useRef(null);
  const longPressTimerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e) => {
      // Handle long press
      if (onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          onLongPress(e);
        }, longPressDelay);
      }

      if (e.touches.length === 1) {
        // Single touch - for swipe
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now()
        };
      } else if (e.touches.length === 2 && (onPinchIn || onPinchOut)) {
        // Two fingers - for pinch
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialDistanceRef.current = distance;
      }
    };

    const handleTouchMove = (e) => {
      // Cancel long press on move
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (e.touches.length === 2 && initialDistanceRef.current) {
        // Pinch gesture
        const currentDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        
        const delta = currentDistance - initialDistanceRef.current;
        
        if (Math.abs(delta) > threshold) {
          if (delta > 0 && onPinchOut) {
            onPinchOut(delta);
          } else if (delta < 0 && onPinchIn) {
            onPinchIn(Math.abs(delta));
          }
          initialDistanceRef.current = currentDistance;
        }
      }
    };

    const handleTouchEnd = (e) => {
      // Cancel long press
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (!touchStartRef.current) return;

      // Use last touch position for swipe
      const touch = e.changedTouches[0];
      touchEndRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };

      const deltaX = touchEndRef.current.x - touchStartRef.current.x;
      const deltaY = touchEndRef.current.y - touchStartRef.current.y;
      const deltaTime = touchEndRef.current.time - touchStartRef.current.time;

      // Ignore if too slow (likely a tap or long press)
      if (deltaTime > 500) {
        touchStartRef.current = null;
        touchEndRef.current = null;
        return;
      }

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Determine swipe direction
      if (absX > threshold || absY > threshold) {
        if (absX > absY) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight({ deltaX, deltaY, deltaTime });
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft({ deltaX, deltaY, deltaTime });
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown({ deltaX, deltaY, deltaTime });
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp({ deltaX, deltaY, deltaTime });
          }
        }
      }

      touchStartRef.current = null;
      touchEndRef.current = null;
      initialDistanceRef.current = null;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [
    enabled, 
    onSwipeLeft, 
    onSwipeRight, 
    onSwipeUp, 
    onSwipeDown,
    onPinchIn,
    onPinchOut,
    onLongPress,
    threshold,
    longPressDelay
  ]);
};

export default useTouchGestures;
