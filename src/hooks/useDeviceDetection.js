// src/hooks/useDeviceDetection.js
import { useState, useEffect } from "react";

export const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const width = window.innerWidth;

      // Mobile detection
      const mobileRegex =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      const isMobileDevice = mobileRegex.test(userAgent) || width <= 768;

      // Tablet detection
      const isTabletDevice =
        (width > 768 && width <= 1024) ||
        (/ipad/i.test(userAgent) && width > 768);

      // Desktop detection
      const isDesktopDevice = width > 1024 && !mobileRegex.test(userAgent);

      setIsMobile(isMobileDevice);
      setIsTablet(isTabletDevice);
      setIsDesktop(isDesktopDevice);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return { isMobile, isTablet, isDesktop };
};
