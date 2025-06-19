import React, { memo } from "react";
import { motion } from "framer-motion";

const GradientBackground = memo(({ mousePosition, theme }) => {
  const backgroundGradient =
    theme === "dark"
      ? `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(22, 163, 175, 0.2), transparent 80%)`
      : `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(22, 163, 175, 0.1), transparent 80%)`;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0"
      style={{ background: backgroundGradient }}
      transition={{ type: "tween", ease: "backOut", duration: 0.5 }}
    />
  );
});

export default GradientBackground;
