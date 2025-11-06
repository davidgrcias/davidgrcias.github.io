import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { useTranslation } from "../contexts/TranslationContext";

const ProjectCarousel = ({ projects }) => {
  const { currentLanguage, translateText } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const autoRotateInterval = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const ROTATION_INTERVAL = 5000; // 5 seconds
  const MIN_SWIPE_DISTANCE = 50;

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const renderIcon = (iconName, size = 20) => {
    const IconComponent = LucideIcons[iconName];
    return IconComponent ? <IconComponent size={size} /> : null;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const monthName = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    const translatedMonth = translateText(monthName, currentLanguage);
    return `${translatedMonth} ${year}`;
  };

  // Auto-rotate functionality
  useEffect(() => {
    if (!isPaused && projects.length > 1) {
      autoRotateInterval.current = setInterval(() => {
        nextProject();
      }, ROTATION_INTERVAL);
    }

    return () => {
      if (autoRotateInterval.current) {
        clearInterval(autoRotateInterval.current);
      }
    };
  }, [isPaused, currentIndex, projects.length]);

  const nextProject = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const prevProject = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const goToProject = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Touch handlers for swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    const isSwipe = Math.abs(distance) > MIN_SWIPE_DISTANCE;

    if (isSwipe) {
      if (distance > 0) {
        nextProject();
      } else {
        prevProject();
      }
    }
  };

  // Slide variants for smooth transitions - Optimized for mobile
  const slideVariants = {
    enter: (direction) => ({
      x: isMobile ? (direction > 0 ? 300 : -300) : (direction > 0 ? 1000 : -1000),
      opacity: 0,
      scale: isMobile ? 0.95 : 0.8,
      rotateY: isMobile ? 0 : (direction > 0 ? 45 : -45), // Disable 3D rotation on mobile
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction) => ({
      x: isMobile ? (direction < 0 ? 300 : -300) : (direction < 0 ? 1000 : -1000),
      opacity: 0,
      scale: isMobile ? 0.95 : 0.8,
      rotateY: isMobile ? 0 : (direction < 0 ? 45 : -45), // Disable 3D rotation on mobile
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  if (!projects || projects.length === 0) {
    return null;
  }

  // Hide carousel on mobile
  if (isMobile) {
    return null;
  }

  const currentProject = projects[currentIndex];

  return (
    <div
      className="relative w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Carousel Container - Compact */}
      <div
        className="relative h-auto min-h-[450px] sm:min-h-[400px] md:h-[480px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={
              isMobile || prefersReducedMotion
                ? {
                    x: { type: "tween", duration: 0.3, ease: "easeInOut" },
                    opacity: { duration: 0.2 },
                    scale: { duration: 0.3 },
                  }
                : {
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.4 },
                    rotateY: { duration: 0.5 },
                  }
            }
            drag={!isMobile ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              if (!isMobile) {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  nextProject();
                } else if (swipe > swipeConfidenceThreshold) {
                  prevProject();
                }
              }
            }}
            className={!isMobile ? "cursor-grab active:cursor-grabbing w-full" : "w-full"}
          >
            <div className="w-full h-auto bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-xl overflow-hidden">
              <div className="flex flex-col md:flex-row min-h-[450px] sm:min-h-[400px] md:h-[480px]">
                {/* Left Side - Project Info */}
                <div className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-between overflow-y-auto">
                  {/* Top Section */}
                  <div className="space-y-3 sm:space-y-4">
                    {/* Project Tiers */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {currentProject.tiers.map((tier) => (
                        <span
                          key={tier}
                          className={`text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium ${
                            tier === "Beginner"
                              ? "bg-cyan-100/80 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300"
                              : tier === "Intermediate"
                              ? "bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              : tier === "Advanced"
                              ? "bg-indigo-100/80 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                              : tier === "Real-World"
                              ? "bg-teal-100/80 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                              : tier === "Experimental"
                              ? "bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                              : "bg-violet-100/80 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                          }`}
                        >
                          {tier}
                        </span>
                      ))}
                    </div>

                    {/* Project Name */}
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white leading-tight">
                      {currentProject.name}
                    </h3>

                    {/* Project Role */}
                    <p className="text-sm sm:text-base md:text-lg font-medium text-cyan-600 dark:text-cyan-400">
                      {currentProject.role}
                    </p>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      {renderIcon("Calendar", 14)}
                      <span>{formatDate(currentProject.date)}</span>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                      {currentProject.description}
                    </p>

                    {/* Technologies */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 flex items-center gap-2">
                        {renderIcon("Code2", 14)}
                        <span>{translateText("Technologies", currentLanguage)}</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {currentProject.tech.map((tech) => (
                          <span
                            key={tech}
                            className="text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-200/70 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-lg font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section - CTA */}
                  <div className="mt-4 sm:mt-6">
                    <a
                      href={currentProject.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-cyan-500 hover:bg-cyan-600 text-white text-sm sm:text-base rounded-lg font-medium transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5"
                    >
                      {translateText("View Project", currentLanguage)}
                      {renderIcon("ExternalLink", 16)}
                    </a>
                  </div>
                </div>

                {/* Right Side - Project Icon/Visual - Hidden on small screens */}
                <div className="hidden md:flex flex-shrink-0 w-full md:w-1/3 bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 items-center justify-center p-8">
                  {!prefersReducedMotion ? (
                    <motion.div
                      animate={{
                        rotateY: [0, 360],
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="text-white/90"
                    >
                      {renderIcon(currentProject.icon, 120)}
                    </motion.div>
                  ) : (
                    <div className="text-white/90">
                      {renderIcon(currentProject.icon, 120)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevProject}
          className="absolute left-1 sm:left-2 md:-left-16 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 hover:bg-cyan-500 dark:hover:bg-cyan-600 text-slate-800 dark:text-white hover:text-white rounded-full p-2 sm:p-3 shadow-lg transition-all duration-300 hover:scale-110 z-10"
          aria-label="Previous project"
        >
          {renderIcon("ChevronLeft", 20)}
        </button>

        <button
          onClick={nextProject}
          className="absolute right-1 sm:right-2 md:-right-16 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 hover:bg-cyan-500 dark:hover:bg-cyan-600 text-slate-800 dark:text-white hover:text-white rounded-full p-2 sm:p-3 shadow-lg transition-all duration-300 hover:scale-110 z-10"
          aria-label="Next project"
        >
          {renderIcon("ChevronRight", 20)}
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
        {projects.map((_, index) => (
          <button
            key={index}
            onClick={() => goToProject(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? "w-8 sm:w-12 h-2 sm:h-3 bg-cyan-500"
                : "w-2 sm:w-3 h-2 sm:h-3 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
            }`}
            aria-label={`Go to project ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-rotate Indicator */}
      <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        {isPaused ? (
          <>
            {renderIcon("Pause", 14)}
            <span className="hidden sm:inline">{translateText("Auto-rotate paused", currentLanguage)}</span>
            <span className="sm:hidden">{translateText("Paused", currentLanguage)}</span>
          </>
        ) : (
          <>
            {renderIcon("Play", 14)}
            <span className="hidden sm:inline">{translateText("Auto-rotating", currentLanguage)}</span>
            <span className="sm:hidden">{translateText("Auto", currentLanguage)}</span>
          </>
        )}
      </div>

      {/* Project Counter */}
      <div className="text-center mt-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
        {currentIndex + 1} / {projects.length}
      </div>
    </div>
  );
};

export default ProjectCarousel;
