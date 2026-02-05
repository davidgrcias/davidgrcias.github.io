import React, { useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import TikTokIcon from "../components/icons/TikTokIcon";
import OptimizedImage from './common/OptimizedImage';
import Header from "./Header";
import AnimatedSection from "./AnimatedSection";
import SectionTitle from "./SectionTitle";
import YouTubeStats from "./YouTubeStats";
import TikTokStats from "./TikTokStats";
import CertificationsSection from "./CertificationsSection";
import ProjectsSection from "./ProjectsSection";
import TiltCard from "./TiltCard";
import PDFThumbnail from "./PDFThumbnail";
import CommandPalette from "./CommandPalette";
import GradientBackground from "./GradientBackground"; // Import the new component
import { getUserProfile } from "../data/userProfile";
import { getInsights } from "../data/insights";
import { getFunFacts } from "../data/funFacts";
import { getExperiences } from "../data/experiences";
import { getProjects } from "../data/projects";
import { getSkills } from "../data/skills";
import { getEducation } from "../data/education";
import { getCertifications } from "../data/certifications";
import { AppContext } from "../AppContext";
import { useTranslation } from "../contexts/TranslationContext";
import ScrollProgressBar from "./ScrollProgressBar";
import ShootingStars from "./ShootingStars";

// Add all Lucide icons to the iconMap
const iconMap = {
  ...LucideIcons,
  TikTok: TikTokIcon,
};

// Render icon helper
const renderIcon = (iconName, size = 24) => {
  const IconComponent = iconMap[iconName];
  return IconComponent ? React.createElement(IconComponent, { size }) : null;
};

const PortfolioContent = () => {
  const { theme, setTheme } = useContext(AppContext);
  const { currentLanguage, translateText } = useTranslation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState("philosophy");
  const [experienceSortOrder, setExperienceSortOrder] = useState("newest");
  const [showAllExperiences, setShowAllExperiences] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const EXPERIENCES_PER_PAGE = 6;
  
  // State for async data from Firestore
  const [userProfile, setUserProfile] = useState(null);
  const [insights, setInsights] = useState([]);
  const [funFacts, setFunFacts] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState({ technical: [], soft: [] });
  const [education, setEducation] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load data from Firestore when component mounts or language changes
  useEffect(() => {
    const loadData = async () => {
      setDataLoading(true);
      try {
        const [
          profileData,
          insightsData,
          funFactsData,
          experiencesData,
          projectsData,
          skillsData,
          educationData,
          certificationsData
        ] = await Promise.all([
          getUserProfile(currentLanguage),
          getInsights(currentLanguage),
          getFunFacts(currentLanguage),
          getExperiences(currentLanguage),
          getProjects(currentLanguage),
          getSkills(currentLanguage),
          getEducation(currentLanguage),
          getCertifications(currentLanguage)
        ]);

        setUserProfile(profileData);
        setInsights(insightsData);
        setFunFacts(funFactsData);
        setExperiences(experiencesData);
        setProjects(projectsData);
        setSkills(skillsData);
        setEducation(educationData);
        setCertifications(certificationsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [currentLanguage]);

  // Command Palette keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle navigation from Command Palette
  const handleNavigate = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Save scroll position before page refresh
  useEffect(() => {
    const handleScroll = () => {
      localStorage.setItem("scrollPosition", window.scrollY.toString());
    };
    window.addEventListener("scroll", handleScroll);

    // Restore scroll position after page loads
    const savedScrollPosition = localStorage.getItem("scrollPosition");
    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition));
      }, 100);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.title = "David Garcia Saragih";
  }, []);

  useEffect(() => {
    const handleMouseMove = (event) =>
      setMousePosition({ x: event.clientX, y: event.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const gridContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  const gridItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const tabRefs = {
    philosophy: React.useRef(null),
    funfacts: React.useRef(null),
  };

  const [tabIndicatorStyle, setTabIndicatorStyle] = useState({
    left: 0,
    width: 0,
  });

  useEffect(() => {
    const ref = tabRefs[activeTab]?.current;
    if (ref) {
      const rect = ref.getBoundingClientRect();
      const parentRect = ref.parentNode.getBoundingClientRect();
      setTabIndicatorStyle({
        left: rect.left - parentRect.left,
        width: rect.width,
      });
    }
  }, [activeTab]);

  const TabButton = ({ id, label, icon }) => (
    <button
      ref={tabRefs[id]}
      onClick={() => setActiveTab(id)}
      className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors duration-300 focus:outline-none ${
        activeTab === id ? "text-cyan-500" : "text-slate-500 dark:text-gray-400"
      }`}
      type="button"
    >
      {icon} {label}
    </button>
  );
  // Format date helper
  const formatDate = (dateStr) => {
    if (dateStr === "present") return translateText("Present", currentLanguage);
    const [year, month] = dateStr.split("-");
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const translatedMonth = translateText(
      months[parseInt(month) - 1],
      currentLanguage
    );
    return `${translatedMonth} ${year}`;
  };

  // Format date range
  const formatDateRange = (startDate, endDate) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return `${start} - ${end}`;
  };

  // Sort experiences
  const sortedExperiences = [...experiences].sort((a, b) => {
    if (experienceSortOrder === "newest") {
      return b.startDate.localeCompare(a.startDate);
    }
    return a.startDate.localeCompare(b.startDate);
  });

  const visibleExperiences = showAllExperiences
    ? sortedExperiences
    : sortedExperiences.slice(0, EXPERIENCES_PER_PAGE);
  const hasMoreExperiences = sortedExperiences.length > EXPERIENCES_PER_PAGE;

  // Toggle description expansion
  const toggleDescription = (index) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Truncate description helper
  const getTruncatedDescription = (description, maxLength = 150) => {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  return (
    <div className="relative">
      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        experiences={experiences}
        projects={projects}
        skills={skills}
        certifications={certifications}
        education={education}
        userProfile={userProfile}
        onNavigate={handleNavigate}
        isDarkMode={theme === 'dark'}
        toggleTheme={toggleTheme}
      />
      
      <ShootingStars />
      <ScrollProgressBar />
      <div
        className={` ${
          theme === "dark"
            ? "dark bg-[#0f172a] text-gray-300"
            : "bg-slate-50 text-slate-700"
        } font-sans leading-relaxed selection:bg-cyan-400/20 transition-colors duration-500 overflow-x-hidden`}
      >
        {/* Use the new GradientBackground component */}
        <GradientBackground mousePosition={mousePosition} theme={theme} />

        <div className="relative z-10">
          <Header />
          <main className="container mx-auto px-6 pt-24">
            {/* Hero Section */}
            <section
              id="hero"
              className="min-h-screen flex flex-col items-center justify-center text-center -mt-20 relative"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="w-32 h-32 md:w-40 md:h-40 mb-6 rounded-full overflow-hidden border-4 border-cyan-500/50 shadow-lg shadow-cyan-500/20 relative z-10"
              >
                <OptimizedImage
                  src={userProfile.photoUrl}
                  alt={userProfile.name}
                  width={160}
                  height={160}
                  quality={90}
                  lazy={false}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl md:text-6xl font-extrabold text-slate-800 dark:text-white mb-2"
              >
                {userProfile.name}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg md:text-xl text-cyan-600 dark:text-cyan-400"
              >
                {userProfile.headline}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex justify-center space-x-6 mt-8"
              >
                <a
                  href={userProfile.socials.github.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative transition-transform duration-300 hover:scale-125"
                >
                  <span className="absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity">
                    <span className="text-gray-500 dark:text-gray-400">
                      {renderIcon("Github", 28)}
                    </span>
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[#333] dark:text-white">
                      {renderIcon("Github", 28)}
                    </span>
                  </span>
                </a>
                <a
                  href={userProfile.socials.youtube.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative transition-transform duration-300 hover:scale-125"
                >
                  <span className="absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity">
                    <span className="text-gray-500 dark:text-gray-400">
                      {renderIcon("Youtube", 28)}
                    </span>
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[#FF0000]">
                      {renderIcon("Youtube", 28)}
                    </span>
                  </span>
                </a>
                <a
                  href={userProfile.socials.tiktok.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative transition-transform duration-300 hover:scale-125"
                >
                  <span className="absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity">
                    <span className="text-gray-500 dark:text-gray-400">
                      {React.createElement(iconMap.TikTok, { size: 28 })}
                    </span>
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[#000000] dark:text-white">
                      {React.createElement(iconMap.TikTok, { size: 28 })}
                    </span>
                  </span>
                </a>
                <a
                  href={userProfile.socials.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative transition-transform duration-300 hover:scale-125"
                >
                  <span className="absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity">
                    <span className="text-gray-500 dark:text-gray-400">
                      {renderIcon("Instagram", 28)}
                    </span>
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[#E4405F]">
                      {renderIcon("Instagram", 28)}
                    </span>
                  </span>
                </a>
                <a
                  href={userProfile.socials.linkedin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative transition-transform duration-300 hover:scale-125"
                >
                  <span className="absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity">
                    <span className="text-gray-500 dark:text-gray-400">
                      {renderIcon("Linkedin", 28)}
                    </span>
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[#0A66C2]">
                      {renderIcon("Linkedin", 28)}
                    </span>
                  </span>
                </a>
              </motion.div>
              
              {/* Command Palette Hint */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mt-12"
              >
                <button
                  onClick={() => setIsCommandPaletteOpen(true)}
                  className="group inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:border-cyan-500/50"
                >
                  <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                    Quick navigation
                  </span>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-xs text-slate-600 dark:text-slate-400 font-mono">
                      {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}
                    </kbd>
                    <span className="text-slate-400">+</span>
                    <kbd className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-xs text-slate-600 dark:text-slate-400 font-mono">
                      K
                    </kbd>
                  </div>
                </button>
              </motion.div>
            </section>
            {/* About Section */}
            <section id="about" className="py-20">
              <AnimatedSection>
                <SectionTitle>
                  {translateText("About Me", currentLanguage)}
                </SectionTitle>
                <p className="max-w-3xl mx-auto text-center text-lg text-slate-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                  {userProfile.aboutText}
                </p>
                <div className="max-w-4xl mx-auto mt-16">
                  <div className="flex justify-center border-b border-slate-200 dark:border-gray-700 mb-8 relative">
                    {" "}
                    <TabButton
                      id="philosophy"
                      label={translateText("My Philosophy", currentLanguage)}
                      icon={renderIcon("BrainCircuit", 18)}
                    />
                    <TabButton
                      id="funfacts"
                      label={translateText(
                        "Personal Fun Facts",
                        currentLanguage
                      )}
                      icon={renderIcon("Gamepad2", 18)}
                    />
                    <motion.div
                      className="absolute bottom-0 h-0.5 bg-cyan-500 rounded"
                      animate={tabIndicatorStyle}
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                      style={{
                        left: tabIndicatorStyle.left,
                        width: tabIndicatorStyle.width,
                      }}
                    />
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {activeTab === "philosophy" && (
                        <motion.div
                          className="grid grid-cols-1 md:grid-cols-2 gap-6"
                          variants={gridContainerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          {insights.map((item) => (
                            <motion.div
                              key={item.title}
                              className="bg-slate-100 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-gray-700 flex items-start gap-4 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1"
                              variants={gridItemVariants}
                            >
                              {" "}
                              <div className="text-cyan-500 dark:text-cyan-400 mt-1 flex-shrink-0">
                                {renderIcon(item.icon) ||
                                  renderIcon("BrainCircuit", 24)}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 dark:text-white mb-1">
                                  {item.title}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-gray-400 whitespace-pre-line">
                                  {item.text}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                      {activeTab === "funfacts" && (
                        <motion.div
                          className="grid grid-cols-1 md:grid-cols-2 gap-6"
                          variants={gridContainerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          {funFacts.map((item) => (
                            <motion.div
                              key={item.title}
                              className="bg-slate-100 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-gray-700 flex items-start gap-4 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1"
                              variants={gridItemVariants}
                            >
                              {" "}
                              <div className="text-cyan-500 dark:text-cyan-400 mt-1 flex-shrink-0">
                                {renderIcon(item.icon) ||
                                  renderIcon("Gamepad2", 24)}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 dark:text-white mb-1">
                                  {item.title}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-gray-400 whitespace-pre-line">
                                  {item.text}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </AnimatedSection>
            </section>{" "}
            {/* Stats Section */}
            <section id="stats" className="py-20">
              <AnimatedSection>
                {" "}
                <SectionTitle>
                  {translateText(
                    "My Content Creation Journey",
                    currentLanguage
                  )}
                </SectionTitle>
                <p className="text-center text-slate-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
                  {translateText(
                    "Engaging with audiences through tech education and sharing knowledge across multiple platforms",
                    currentLanguage
                  )}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <YouTubeStats />
                  <TikTokStats />
                </div>
                <div className="flex justify-center mt-8 gap-4">
                  {" "}
                  <a
                    href={userProfile.socials.youtube.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-transform duration-300 hover:scale-105 flex items-center"
                  >
                    {renderIcon("Youtube", 20)}
                    <span className="ml-2">
                      {translateText("Visit YouTube Channel", currentLanguage)}
                    </span>
                  </a>
                  <a
                    href={userProfile.socials.tiktok.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-800 hover:bg-slate-900 text-white dark:bg-white/90 dark:hover:bg-white dark:text-black font-bold py-3 px-6 rounded-lg transition-transform duration-300 hover:scale-105 flex items-center"
                  >
                    {renderIcon("TikTok", 20)}
                    <span className="ml-2">
                      {translateText("Follow on TikTok", currentLanguage)}
                    </span>
                  </a>
                </div>
              </AnimatedSection>
            </section>{" "}
            {/* Education Section */}
            <section id="education" className="py-20">
              <AnimatedSection>
                {" "}
                <SectionTitle>
                  {translateText("Education", currentLanguage)}
                </SectionTitle>
                <p className="text-center text-slate-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
                  {translateText(
                    "Academic journey and formal education that shaped my technical foundation and professional growth",
                    currentLanguage
                  )}
                </p>
                <div className="relative border-l-2 border-cyan-500/30 pl-10">
                  {education.map((edu, index) => (
                    <motion.div
                      key={index}
                      className="mb-12 relative"
                      viewport={{ once: true }}
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.2 }}
                    >
                      <div className="absolute -left-[49px] top-1 w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full border-4 border-cyan-500">
                        <div className="absolute inset-0 flex items-center justify-center text-cyan-500 dark:text-cyan-400">
                          {renderIcon("GraduationCap", 14)}
                        </div>
                      </div>
                      <p className="text-cyan-600 dark:text-cyan-400 text-sm mb-1">
                        {edu.period}
                      </p>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        {edu.institution}
                      </h3>
                      <p className="text-slate-500 dark:text-gray-400 mb-2">
                        {edu.degree}
                      </p>
                      {edu.grade && (
                        <div className="inline-block bg-slate-200/50 dark:bg-slate-700/50 px-3 py-1 rounded-full">
                          <p className="text-sm text-cyan-600 dark:text-cyan-400">
                            {translateText("GPA", currentLanguage)}: {edu.grade}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </AnimatedSection>
            </section>
            {/* Experience Section */}
            <section id="experience" className="py-20">
              <AnimatedSection>
                <SectionTitle>
                  {translateText("Experience", currentLanguage)}
                </SectionTitle>
                <p className="text-center text-slate-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                  {translateText(
                    "Professional milestones and hands-on experience across diverse tech projects and leadership roles",
                    currentLanguage
                  )}
                </p>
                
                {/* Sort Control */}
                <div className="flex justify-end mb-8">
                  <button
                    onClick={() =>
                      setExperienceSortOrder(
                        experienceSortOrder === "newest" ? "oldest" : "newest"
                      )
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all duration-300"
                  >
                    {renderIcon(
                      experienceSortOrder === "newest" ? "ArrowDown" : "ArrowUp"
                    )}
                    {translateText(
                      experienceSortOrder === "newest"
                        ? "Newest First"
                        : "Oldest First",
                      currentLanguage
                    )}
                  </button>
                </div>
                
                {/* Experience Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {visibleExperiences && visibleExperiences.length > 0 ? (
                    visibleExperiences.map((exp, index) => {
                      // Simplify rendering - no conditional wrappers
                      return (
                        <div 
                          key={`exp-${exp.company}-${index}`} 
                          className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-gray-700 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-xl"
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <div className="bg-cyan-500/10 dark:bg-cyan-500/5 rounded-lg p-3 text-cyan-500 dark:text-cyan-400 flex-shrink-0">
                              {renderIcon("Building", 24)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-4 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                    {exp.role}
                                  </h3>
                                  <p className="text-cyan-600 dark:text-cyan-400 font-medium">
                                    {exp.company}
                                  </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <span className="text-sm text-slate-500 dark:text-slate-400">
                                    {formatDateRange(exp.startDate, exp.endDate)}
                                  </span>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {exp.type}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Location */}
                              {exp.location && (
                                <div className="flex items-center gap-2 mb-3 text-sm text-slate-600 dark:text-slate-400">
                                  {renderIcon("MapPin", 16)}
                                  <span>{exp.location}</span>
                                  {exp.locationType && (
                                    <>
                                      <span className="text-slate-400 dark:text-slate-500">•</span>
                                      <span>{exp.locationType}</span>
                                    </>
                                  )}
                                </div>
                              )}
                              
                              {/* Description */}
                              {exp.description && (
                                <div className="mb-4">
                                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                    {expandedDescriptions[index] 
                                      ? exp.description 
                                      : getTruncatedDescription(exp.description, 150)
                                    }
                                  </p>
                                  {exp.description.length > 150 && (
                                    <button
                                      onClick={() => toggleDescription(index)}
                                      className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 mt-2 font-medium flex items-center gap-1"
                                    >
                                      {expandedDescriptions[index] ? (
                                        <>
                                          Show Less {renderIcon("ChevronUp", 14)}
                                        </>
                                      ) : (
                                        <>
                                          Read More {renderIcon("ChevronDown", 14)}
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              )}
                              
                              {/* Skills */}
                              {exp.skills && exp.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {exp.skills.map((skill, idx) => (
                                    <span
                                      key={`${skill}-${idx}`}
                                      className="bg-slate-200/70 dark:bg-slate-700/50 text-xs text-cyan-700 dark:text-cyan-300 py-1 px-3 rounded-full"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              {/* Media Section - Compact Layout */}
                              {exp.media && (
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                  <a
                                    href={exp.media.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex gap-3 group/media"
                                  >
                                    {/* Compact Thumbnail - Left Side */}
                                    <div className="relative overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700 w-20 h-20 flex-shrink-0 hover:ring-2 hover:ring-cyan-500 transition-all duration-300 shadow-sm hover:shadow-md">
                                      {exp.media.type === 'pdf' && !exp.media.thumbnail ? (
                                        <div className="w-full h-full flex items-center justify-center">
                                          {renderIcon("FileText", 32)}
                                        </div>
                                      ) : exp.media.thumbnail ? (
                                        <>
                                          <OptimizedImage
                                            src={exp.media.thumbnail}
                                            alt={exp.media.title}
                                            width={80}
                                            height={80}
                                            quality={80}
                                            className="w-full h-full object-cover group-hover/media:scale-110 transition-transform duration-300"
                                          />
                                          {exp.media.type === 'pdf' && (
                                            <div className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                                              PDF
                                            </div>
                                          )}
                                        </>
                                      ) : (
                                          <OptimizedImage
                                            src={exp.media.url}
                                            alt={exp.media.title}
                                            width={80}
                                            height={80}
                                            quality={80}
                                            className="w-full h-full object-cover group-hover/media:scale-110 transition-transform duration-300"
                                          />
                                      )}
                                      <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                                        <div className="opacity-0 group-hover/media:opacity-100 transition-opacity duration-300 bg-white/90 dark:bg-slate-800/90 rounded-full p-1.5">
                                          {renderIcon("ExternalLink", 16)}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Media Info - Right Side */}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-xs font-semibold text-slate-800 dark:text-white group-hover/media:text-cyan-600 dark:group-hover/media:text-cyan-400 transition-colors flex items-center gap-1.5 mb-1">
                                        <span className="truncate">{exp.media.title}</span>
                                        {renderIcon("ExternalLink", 12)}
                                      </h4>
                                      {exp.media.description && (
                                        <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                          {exp.media.description}
                                        </p>
                                      )}
                                    </div>
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full text-center py-8 text-slate-500">
                      <p>No experiences available</p>
                    </div>
                  )}
                </div>
                
                {/* Show More Button */}
                {hasMoreExperiences && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => setShowAllExperiences(!showAllExperiences)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/20"
                    >
                      {showAllExperiences ? (
                        <>
                          {renderIcon("ChevronUp")}
                          {translateText("Show Less Experiences", currentLanguage)}
                        </>
                      ) : (
                        <>
                          {renderIcon("ChevronDown")}
                          {translateText("Show More Experiences", currentLanguage)}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </AnimatedSection>
            </section>{" "}
            {/* Projects Section */}
            <section id="projects" className="py-20">
              <AnimatedSection>
                <ProjectsSection />
              </AnimatedSection>
            </section>
            {/* Skills & Certifications Section */}
            <section id="skills" className="py-20">
              <AnimatedSection>
                <SectionTitle>
                  {translateText("Core Competencies", currentLanguage)}
                </SectionTitle>
                <p className="text-center text-slate-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
                  {translateText(
                    "A comprehensive overview of technical expertise and professional skills developed through hands-on experience, continuous learning, and diverse projects",
                    currentLanguage
                  )}
                </p>

                {/* Technical Skills */}
                <div className="mb-16">
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-8 flex items-center justify-center gap-3">
                    {renderIcon("Code", 28)}
                    <span>{translateText("Technical Skills", currentLanguage)}</span>
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {skills.technical?.map((category, index) => (
                      <motion.div
                        key={index}
                        className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-gray-700 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300"
                        viewport={{ once: true }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                          <div className="bg-cyan-500/10 dark:bg-cyan-500/20 p-2 rounded-lg text-cyan-600 dark:text-cyan-400">
                            {renderIcon(category.icon, 24)}
                          </div>
                          <h4 className="text-lg font-bold text-slate-800 dark:text-white">
                            {category.category}
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {category.skills.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="bg-slate-200/70 dark:bg-slate-700/50 text-xs text-slate-700 dark:text-slate-300 py-1.5 px-3 rounded-full hover:bg-cyan-500/20 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors duration-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Soft Skills */}
                <div className="mb-16">
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-8 flex items-center justify-center gap-3">
                    {renderIcon("Heart", 28)}
                    <span>{translateText("Soft Skills", currentLanguage)}</span>
                  </h3>
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-800/50 p-8 rounded-2xl border border-slate-200 dark:border-gray-700">
                    <div className="flex flex-wrap justify-center gap-3">
                      {skills.soft?.map((skill, index) => (
                        <motion.span
                          key={index}
                          className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 px-5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-cyan-500 hover:shadow-md hover:shadow-cyan-500/20 transition-all duration-200 font-medium text-sm"
                          viewport={{ once: true }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ y: -2 }}
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-8 flex items-center justify-center gap-3">
                    {renderIcon("Trophy", 28)}
                    <span>{translateText("Licenses & Certifications", currentLanguage)}</span>
                  </h3>
                  <p className="text-center text-slate-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                    {translateText(
                      "Professional certifications and achievements validating expertise in various technical domains",
                      currentLanguage
                    )}
                  </p>
                  <CertificationsSection />
                </div>
              </AnimatedSection>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 text-center">
              <AnimatedSection>
                {" "}
                <SectionTitle>
                  {translateText("Get In Touch", currentLanguage)}
                </SectionTitle>
                <p className="max-w-xl mx-auto text-slate-600 dark:text-gray-400 mb-8">
                  {translateText(
                    "I'm currently open to new opportunities and collaborations. Feel free to reach out if you have a project in mind or just want to connect!",
                    currentLanguage
                  )}
                </p>
                <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 mb-8 text-lg">
                  <div className="flex items-center">
                    {" "}
                    <span className="mr-3">{renderIcon("Mail")}</span>
                    <a
                      href={`mailto:${userProfile.contact.email}`}
                      className="text-slate-800 dark:text-white hover:underline ml-1"
                    >
                      {userProfile.contact.email}
                    </a>
                  </div>
                  <div className="flex items-center">
                    {" "}
                    <span className="mr-3">{renderIcon("MapPin")}</span>
                    <span className="text-slate-800 dark:text-white ml-1">
                      {userProfile.contact.location}
                    </span>
                  </div>
                </div>
                
                {/* Contact Buttons - Symmetric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto mb-6">
                  {/* WhatsApp */}
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 p-5 rounded-xl border border-cyan-200 dark:border-cyan-800 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      {renderIcon("MessageCircle", 24)}
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white">WhatsApp</h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex-1">
                      {translateText("Quick messages and instant responses", currentLanguage)}
                    </p>
                    <a
                      href={`https://wa.me/${userProfile.contact.whatsapp}?text=Hi`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/20"
                    >
                      {translateText("Chat Now", currentLanguage)}
                    </a>
                  </div>
                  
                  {/* 15 min Meeting */}
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      {renderIcon("Clock", 24)}
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                        {translateText("Quick Chat", currentLanguage)}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex-1">
                      {translateText("15-minute Google Meet for quick questions", currentLanguage)}
                    </p>
                    <a
                      href="https://cal.com/davidgrcias/15min"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-slate-500/20"
                    >
                      {translateText("Book 15 min", currentLanguage)}
                    </a>
                  </div>
                  
                  {/* 30 min Meeting */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      {renderIcon("Video", 24)}
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                        {translateText("Deep Dive", currentLanguage)}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex-1">
                      {translateText("30-minute Google Meet for detailed discussion", currentLanguage)}
                    </p>
                    <a
                      href="https://cal.com/davidgrcias/30min"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/20"
                    >
                      {translateText("Book 30 min", currentLanguage)}
                    </a>
                  </div>
                </div>
                
                {/* Additional Note */}
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                  {translateText("All meetings are conducted via Google Meet and scheduled through Cal.com", currentLanguage)}
                </p>
              </AnimatedSection>
            </section>
          </main>
          <footer className="py-8 border-t border-slate-200 dark:border-gray-800">
            <div className="container mx-auto px-6 text-center text-slate-500 dark:text-gray-500 text-sm">
              {" "}
              <p>
                &copy; {new Date().getFullYear()} {userProfile.name}.{" "}
                {translateText("Designed & Built with", currentLanguage)} ❤️.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default PortfolioContent;
