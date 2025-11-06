import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TiltCard = ({ 
  children, 
  className = '',
  glareEnable = true,
  tiltMaxAngleX = 10,
  tiltMaxAngleY = 10,
  glareMaxOpacity = 0.3,
  scale = 1.02,
  perspective = 1000,
  transitionSpeed = 400
}) => {
  const cardRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // Default true for SSR
  const [transform, setTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    glareOpacity: 0
  });

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e) => {
    if (!cardRef.current || isMobile) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Calculate mouse position relative to card (0 to 1)
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // Calculate rotation angles
    const rotateY = (x - 0.5) * tiltMaxAngleY * 2;
    const rotateX = (0.5 - y) * tiltMaxAngleX * 2;
    
    // Calculate glare position (percentage)
    const glareX = x * 100;
    const glareY = y * 100;

    setTransform({
      rotateX,
      rotateY,
      glareX,
      glareY,
      glareOpacity: glareEnable ? glareMaxOpacity : 0
    });
  };

  const handleMouseEnter = () => {
    if (isMobile) return;
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setIsHovering(false);
    setTransform({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      glareOpacity: 0
    });
  };

  // Simple wrapper for mobile - NO 3D effects
  if (isMobile) {
    return <div className={className}>{children}</div>;
  }

  // Full 3D tilt for desktop only
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`tilt-card-wrapper ${className}`}
      style={{
        perspective: `${perspective}px`,
        transformStyle: 'preserve-3d',
      }}
    >
      <motion.div
        className="tilt-card-inner"
        animate={{
          rotateX: transform.rotateX,
          rotateY: transform.rotateY,
          scale: isHovering ? scale : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
          mass: 0.5
        }}
        style={{
          transformStyle: 'preserve-3d',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        {children}
        
        {/* Glare/Shine Effect */}
        {glareEnable && (
          <div
            className="tilt-glare"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              borderRadius: 'inherit',
              background: `radial-gradient(circle at ${transform.glareX}% ${transform.glareY}%, rgba(255, 255, 255, ${transform.glareOpacity}) 0%, transparent 50%)`,
              transition: `opacity ${transitionSpeed}ms ease`,
              opacity: isHovering ? 1 : 0,
            }}
          />
        )}
        
        {/* Depth Shadow */}
        <div
          className="tilt-shadow"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100%',
            height: '100%',
            transform: 'translateZ(-20px) translateX(-50%) translateY(-50%)',
            background: 'rgba(0, 0, 0, 0.1)',
            filter: 'blur(20px)',
            borderRadius: 'inherit',
            opacity: isHovering ? 0.5 : 0,
            transition: `opacity ${transitionSpeed}ms ease`,
            pointerEvents: 'none',
          }}
        />
      </motion.div>
    </div>
  );
};

export default TiltCard;
