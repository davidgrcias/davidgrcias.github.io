// src/components/CustomCursor.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updatePosition = (e) => setPosition({ x: e.clientX, y: e.clientY });
    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, [role="button"]')) setIsHovering(true);
    };
    const handleMouseOut = (e) => {
      if (e.target.closest('a, button, [role="button"]')) setIsHovering(false);
    };

    window.addEventListener("mousemove", updatePosition);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  const cursorVariants = {
    default: {
      scale: 1,
      opacity: 0.6,
    },
    hovering: {
      scale: 1.5,
      opacity: 0.8,
    },
  };

  return (
    <motion.div
      className="hidden lg:block pointer-events-none fixed top-0 left-0 z-[999] w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/60"
      style={{
        x: position.x - 12, // Adjusted for new size (24px/2)
        y: position.y - 12,
        mixBlendMode: "difference",
      }}
      variants={cursorVariants}
      animate={isHovering ? "hovering" : "default"}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    />
  );
};

export default CustomCursor;
