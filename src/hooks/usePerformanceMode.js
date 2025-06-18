// src/hooks/usePerformanceMode.js
import { useState, useEffect } from "react";
import { useDeviceDetection } from "./useDeviceDetection";

export const usePerformanceMode = () => {
  const { isMobile, isTablet } = useDeviceDetection();
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [performanceMode, setPerformanceMode] = useState("high");

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    // Determine performance mode based on device
    if (isMobile) {
      setPerformanceMode("low");
    } else if (isTablet) {
      setPerformanceMode("medium");
    } else {
      setPerformanceMode("high");
    }

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [isMobile, isTablet]);

  return {
    performanceMode,
    isReducedMotion,
    shouldReduceAnimations: isReducedMotion || isMobile,
    shouldReduceEffects: isMobile,
    shouldUseLightEffects: isTablet,
  };
};
