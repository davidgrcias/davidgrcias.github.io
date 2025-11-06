import React, { useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import TikTokIcon from "../components/icons/TikTokIcon";
import Header from "./Header";
import AnimatedSection from "./AnimatedSection";
import SectionTitle from "./SectionTitle";
import YouTubeStats from "./YouTubeStats";
import TikTokStats from "./TikTokStats";
import CertificationsSection from "./CertificationsSection";
import ProjectsSection from "./ProjectsSection";
import PDFThumbnail from "./PDFThumbnail";
import GradientBackground from "./GradientBackground"; // Import the new component
import { getUserProfile } from "../data/userProfile";
import { getInsights } from "../data/insights";
import { getFunFacts } from "../data/funFacts";
import { getExperiences } from "../data/experiences";
import { getProjects } from "../data/projects";
import { getSkills } from "../data/skills";
import { getEducation } from "../data/education";
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
  const { theme } = useContext(AppContext);
  const { currentLanguage, translateText } = useTranslation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState("philosophy");
  const [experienceSortOrder, setExperienceSortOrder] = useState("newest");
  const [showAllExperiences, setShowAllExperiences] = useState(false);
  const EXPERIENCES_PER_PAGE = 6; // Get translated data based on current language
  const userProfile = getUserProfile(currentLanguage);
  const insights = getInsights(currentLanguage);
  const funFacts = getFunFacts(currentLanguage);
  const experiences = getExperiences(currentLanguage);
  const projects = getProjects(currentLanguage);
  const skills = getSkills(currentLanguage);
  const education = getEducation(currentLanguage);

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

  return (
    <div className="relative">
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
                <img
                  src={userProfile.photoUrl}
                  alt={userProfile.name}
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
            </section>
            {/* About Section */}
            <section id="about" className="py-20">
              <AnimatedSection>
                <SectionTitle>
                  {translateText("About Me", currentLanguage)}
                </SectionTitle>
                <p className="max-w-3xl mx-auto text-center text-lg text-slate-600 dark:text-gray-400 leading-relaxed">
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
                                <p className="text-sm text-slate-600 dark:text-gray-400">
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
                                <p className="text-sm text-slate-600 dark:text-gray-400">
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
                {" "}
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
                  <motion.button
                    onClick={() =>
                      setExperienceSortOrder(
                        experienceSortOrder === "newest" ? "oldest" : "newest"
                      )
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all duration-300"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {" "}
                    {renderIcon(
                      experienceSortOrder === "newest" ? "ArrowDown" : "ArrowUp"
                    )}
                    {translateText(
                      experienceSortOrder === "newest"
                        ? "Newest First"
                        : "Oldest First",
                      currentLanguage
                    )}
                  </motion.button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <AnimatePresence mode="popLayout">
                    {visibleExperiences.map((exp, index) => (
                      <motion.div
                        key={`${exp.company}-${exp.role}`}
                        className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-gray-700 group transition-all duration-300 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-2"
                        viewport={{ once: true }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
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
                              </div>{" "}
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
                              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed whitespace-pre-line">
                                {exp.description}
                              </p>
                            )}
                            
                            {/* Skills */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {exp.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="bg-slate-200/70 dark:bg-slate-700/50 text-xs text-cyan-700 dark:text-cyan-300 py-1 px-3 rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                            
                            {/* Media Section */}
                            {exp.media && (
                              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <a
                                  href={exp.media.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block group/media"
                                >
                                  <div className="relative overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-700 aspect-video mb-3 hover:ring-2 hover:ring-cyan-500 transition-all duration-300 shadow-md hover:shadow-xl">
                                    {exp.media.type === 'pdf' && !exp.media.thumbnail ? (
                                      <PDFThumbnail />
                                    ) : exp.media.thumbnail ? (
                                      <>
                                        <img
                                          src={exp.media.thumbnail}
                                          alt={exp.media.title}
                                          className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300"
                                        />
                                        {exp.media.type === 'pdf' && (
                                          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded shadow-lg">
                                            PDF
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <img
                                        src={exp.media.url}
                                        alt={exp.media.title}
                                        className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300"
                                      />
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                                      <div className="opacity-0 group-hover/media:opacity-100 transition-opacity duration-300 bg-white/90 dark:bg-slate-800/90 rounded-full p-3 shadow-lg">
                                        {renderIcon("ExternalLink", 24)}
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-800 dark:text-white group-hover/media:text-cyan-600 dark:group-hover/media:text-cyan-400 transition-colors flex items-center gap-2">
                                      <span className="flex-1">{exp.media.title}</span>
                                      {renderIcon("ExternalLink", 16)}
                                    </h4>
                                    {exp.media.description && (
                                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                        {exp.media.description}
                                      </p>
                                    )}
                                  </div>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {/* Show More/Less Button */}
                {hasMoreExperiences && (
                  <div className="mt-8 text-center">
                    <motion.button
                      onClick={() => setShowAllExperiences(!showAllExperiences)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/20"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {" "}
                      {showAllExperiences ? (
                        <>
                          {renderIcon("ChevronUp")}
                          {translateText(
                            "Show Less Experiences",
                            currentLanguage
                          )}
                        </>
                      ) : (
                        <>
                          {renderIcon("ChevronDown")}
                          {translateText(
                            "Show More Experiences",
                            currentLanguage
                          )}
                        </>
                      )}
                    </motion.button>
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
                </div>{" "}
                <a
                  href={`https://wa.me/${userProfile.contact.whatsapp}?text=Hi`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition-transform duration-300 hover:scale-105 inline-block shadow-lg shadow-cyan-500/20"
                >
                  {translateText("Say Hello on WhatsApp", currentLanguage)}
                </a>
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
