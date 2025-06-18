// src/components/PerformanceWrapper.jsx
import React from "react";
import { usePerformanceMode } from "../hooks/usePerformanceMode";

const PerformanceWrapper = ({ children, enableAnimations = true }) => {
  const { shouldReduceAnimations, shouldReduceEffects } = usePerformanceMode();

  // If effects should be reduced, return null or minimal component
  if (shouldReduceEffects && !enableAnimations) {
    return null;
  }

  // If animations should be reduced, wrap in div without animations
  if (shouldReduceAnimations) {
    return <div className="reduced-motion">{children}</div>;
  }

  return children;
};

export default PerformanceWrapper;
