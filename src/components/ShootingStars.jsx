import React from "react";
import { useDeviceDetection } from "../hooks/useDeviceDetection";

const ShootingStars = () => {
  const { isMobile, isTablet } = useDeviceDetection();

  // Reduce number of shooting stars on mobile/tablet for better performance
  const numberOfStars = isMobile ? 2 : isTablet ? 3 : 6;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: numberOfStars }, (_, index) => (
        <div
          key={index}
          className={`shooting-star shooting-star-${index + 1}`}
        ></div>
      ))}{" "}
    </div>
  );
};

export default ShootingStars;
