import React from "react";
import { useDeviceDetection } from "../hooks/useDeviceDetection";

const ShootingStars = () => {
  const { isMobile, isTablet } = useDeviceDetection();

  // Disable shooting stars on mobile for better performance
  if (isMobile) {
    return null;
  }

  // Set number of shooting stars based on device
  const numberOfStars = isTablet ? 3 : 6;
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
      {/* Always render at least basic stars for testing */}
      <div className="shooting-star shooting-star-1"></div>
      <div className="shooting-star shooting-star-2"></div>
      <div className="shooting-star shooting-star-3"></div>
      {numberOfStars >= 4 && (
        <div className="shooting-star shooting-star-4"></div>
      )}
      {numberOfStars >= 5 && (
        <div className="shooting-star shooting-star-5"></div>
      )}
      {numberOfStars >= 6 && (
        <div className="shooting-star shooting-star-6"></div>
      )}
    </div>
  );
};

export default ShootingStars;
