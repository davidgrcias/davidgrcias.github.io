// src/components/CustomCursor.jsx
import React, { useState, useEffect, useMemo } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Constants
const CURSOR_SIZE = 24;
const NUM_TRAIL_DOTS = 25;
const SPRING_CONFIG = { damping: 30, stiffness: 500 };
const TRAIL_SPRING_CONFIG = { damping: 20, stiffness: 200 };

// Helper functions
const createSpring = (motionValue, index) => {
  return useSpring(motionValue, {
    ...TRAIL_SPRING_CONFIG,
    damping: 20 + index * 2,
  });
};

// Helper component for each dot in the trail
const TrailDot = ({ x, y, opacity, size }) => {
  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[990] rounded-full bg-white/30"
      style={{
        x,
        y,
        width: size,
        height: size,
        opacity: opacity,
        // Using a filter for a softer, more "smokey" look
        filter: "blur(3px)",
        backdropFilter: "blur(2px)",
        // We need to move the dot's origin to its center for proper positioning
        translateX: "-50%",
        translateY: "-50%",
      }}
    />
  );
};

const useTrailSprings = (mouseX, mouseY) => {
  const springXs = [];
  const springYs = [];

  for (let i = 0; i < NUM_TRAIL_DOTS; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    springXs.push(createSpring(mouseX, i));
    // eslint-disable-next-line react-hooks/rules-of-hooks
    springYs.push(createSpring(mouseY, i));
  }

  return [springXs, springYs];
};

const CustomCursor = () => {
  // State to track if hovering over interactive elements
  const [isHovering, setIsHovering] = useState(false);

  // Using Motion Values for direct, performant updates
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Create a chain of springs for the trail effect using useMemo
  const [trailX, trailY] = useTrailSprings(mouseX, mouseY);

  useEffect(() => {
    // Hide the default system cursor
    // A style tag is injected into the head to achieve this
    const style = document.createElement("style");
    style.innerHTML = `
      body, a, button, [role="button"] {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    // --- Event Listeners ---
    const updatePosition = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, [role="button"]')) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e) => {
      // Remove the target check to ensure it always resets when leaving any element
      setIsHovering(false);
    };
    window.addEventListener("mousemove", updatePosition);

    // Listen to mouseover/mouseout on clickable elements
    const clickableElements = document.querySelectorAll(
      'a, button, [role="button"]'
    );
    clickableElements.forEach((element) => {
      element.addEventListener("mouseenter", handleMouseOver);
      element.addEventListener("mouseleave", handleMouseOut);
    });

    // --- Cleanup ---
    return () => {
      document.head.removeChild(style);
      window.removeEventListener("mousemove", updatePosition);

      // Clean up event listeners from clickable elements
      const clickableElements = document.querySelectorAll(
        'a, button, [role="button"]'
      );
      clickableElements.forEach((element) => {
        element.removeEventListener("mouseenter", handleMouseOver);
        element.removeEventListener("mouseleave", handleMouseOut);
      });
    };
  }, [mouseX, mouseY]);

  // Variants for the main cursor animation
  const cursorVariants = {
    default: {
      scale: 1,
      backgroundColor: "rgba(0, 255, 255, 0.2)",
      borderColor: "rgba(0, 255, 255, 0.6)",
      borderWidth: "2px",
    },
    hovering: {
      scale: 1.5,
      backgroundColor: "rgba(0, 255, 255, 0)", // Becomes a ring
      borderColor: "rgba(0, 255, 255, 1)",
      borderWidth: "2px",
    },
  };

  // Variants for the inner dot of the pointer
  const pointerDotVariants = {
    default: {
      scale: 0,
      opacity: 0,
    },
    hovering: {
      scale: 1,
      opacity: 1,
    },
  };

  return (
    <>
      {/* Render the trail dots */}{" "}
      {trailX.map((x, i) => {
        // More gradual fade out for subtler effect
        const opacity = 0.15 - (i / NUM_TRAIL_DOTS) * 0.14; // More subtle opacity
        // Smaller dots that decrease more gradually
        const size = CURSOR_SIZE * 0.5 * (1 - (i / NUM_TRAIL_DOTS) * 0.5); // Smaller trail dots
        return (
          <TrailDot key={i} x={x} y={trailY[i]} opacity={opacity} size={size} />
        );
      })}
      {/* Main Cursor Element */}
      <motion.div
        className="hidden lg:flex items-center justify-center pointer-events-none fixed top-0 left-0 z-[999] rounded-full"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          width: CURSOR_SIZE,
          height: CURSOR_SIZE,
          mixBlendMode: "difference", // This blend mode creates cool color inversion effects
        }}
        variants={cursorVariants}
        animate={isHovering ? "hovering" : "default"}
        transition={{ type: "spring", ...SPRING_CONFIG }}
      >
        {/* Inner dot that appears on hover to create the pointer effect */}
        <motion.div
          className="w-1 h-1 rounded-full bg-cyan-400"
          variants={pointerDotVariants}
          animate={isHovering ? "hovering" : "default"}
          transition={{ type: "spring", stiffness: 600, damping: 20 }}
        />
      </motion.div>
    </>
  );
};

export default CustomCursor;
