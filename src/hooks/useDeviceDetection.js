import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Enhanced device detection hook
 * Detects device type, touch capability, orientation, and screen category
 */
export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const h = typeof window !== 'undefined' ? window.innerHeight : 1080;
    return getDeviceInfo(w, h);
  });

  const rafId = useRef(null);

  const handleResize = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      setDeviceInfo(getDeviceInfo(window.innerWidth, window.innerHeight));
    });
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [handleResize]);

  return deviceInfo;
};

function getDeviceInfo(width, height) {
  const isTouchDevice = typeof window !== 'undefined' && (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );

  const isSmallPhone = width < 480;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isPortrait = height > width;
  const isLandscape = width >= height;

  let screenCategory = 'desktop';
  if (isSmallPhone) screenCategory = 'phone-small';
  else if (isMobile) screenCategory = 'phone';
  else if (isTablet) screenCategory = 'tablet';

  return {
    isMobile,
    isTablet,
    isDesktop,
    isSmallPhone,
    isTouchDevice,
    isPortrait,
    isLandscape,
    screenCategory,
    width,
    height,
  };
}

export default useDeviceDetection;
