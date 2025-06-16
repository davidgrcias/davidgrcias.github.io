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
import userProfile from "../data/userProfile";
import insights from "../data/insights";
import funFacts from "../data/funFacts";
import experiences from "../data/experiences";
import projects from "../data/projects";
import skills from "../data/skills";
import education from "../data/education";
import { AppContext } from "../AppContext";
import ScrollProgressBar from "./ScrollProgressBar";

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState("philosophy");

  useEffect(() => {
    document.title = "David Garcia Saragih";
  }, []);

  useEffect(() => {
    const handleMouseMove = (event) =>
      setMousePosition({ x: event.clientX, y: event.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const backgroundGradient =
    theme === "dark"
      ? `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(22, 163, 175, 0.2), transparent 80%)`
      : `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(22, 163, 175, 0.1), transparent 80%)`;

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

  return (
    <>
      <ScrollProgressBar />
      <div
        className={` ${
          theme === "dark"
            ? "dark bg-[#0f172a] text-gray-300"
            : "bg-slate-50 text-slate-700"
        } font-sans leading-relaxed selection:bg-cyan-400/20 transition-colors duration-500 overflow-x-hidden`}
      >
        <motion.div
          className="pointer-events-none fixed inset-0 z-0"
          style={{ background: backgroundGradient }}
          transition={{ type: "tween", ease: "backOut", duration: 0.5 }}
        />
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
                  className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-transform duration-300 hover:scale-125"
                >
                  {renderIcon("Github", 28)}
                </a>
                <a
                  href={userProfile.socials.youtube.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition-transform duration-300 hover:scale-125"
                >
                  {renderIcon("Youtube", 28)}
                </a>
                <a
                  href={userProfile.socials.tiktok.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-transform duration-300 hover:scale-125"
                >
                  {React.createElement(iconMap.TikTok, { size: 28 })}
                </a>
                <a
                  href={userProfile.socials.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 dark:text-gray-400 hover:text-pink-500 transition-transform duration-300 hover:scale-125"
                >
                  {renderIcon("Instagram", 28)}
                </a>
                <a
                  href={userProfile.socials.linkedin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-transform duration-300 hover:scale-125"
                >
                  {renderIcon("Linkedin", 28)}
                </a>
              </motion.div>
            </section>
            {/* About Section */}
            <section id="about" className="py-20">
              <AnimatedSection>
                <SectionTitle>About Me</SectionTitle>
                <p className="max-w-3xl mx-auto text-center text-lg text-slate-600 dark:text-gray-400 leading-relaxed">
                  {userProfile.aboutText}
                </p>
                <div className="max-w-4xl mx-auto mt-16">
                  <div className="flex justify-center border-b border-slate-200 dark:border-gray-700 mb-8 relative">
                    {" "}
                    <TabButton
                      id="philosophy"
                      label="My Philosophy"
                      icon={renderIcon("BrainCircuit", 18)}
                    />{" "}
                    <TabButton
                      id="funfacts"
                      label="Personal Fun Facts"
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
                <SectionTitle>My Content Creation Journey</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <YouTubeStats />
                  <TikTokStats />
                </div>
                <div className="flex justify-center mt-8 gap-4">
                  <a
                    href={userProfile.socials.youtube.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-transform duration-300 hover:scale-105 flex items-center"
                  >
                    {renderIcon("Youtube", 20)}
                    <span className="ml-2">Visit YouTube Channel</span>
                  </a>
                  <a
                    href={userProfile.socials.tiktok.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-800 hover:bg-slate-900 text-white dark:bg-white/90 dark:hover:bg-white dark:text-black font-bold py-3 px-6 rounded-lg transition-transform duration-300 hover:scale-105 flex items-center"
                  >
                    {" "}
                    {renderIcon("TikTok", 20)}
                    <span className="ml-2">Follow on TikTok</span>
                  </a>
                </div>
              </AnimatedSection>
            </section>{" "}
            {/* Education Section */}
            <section id="education" className="py-20">
              <AnimatedSection>
                <SectionTitle>Education</SectionTitle>
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
                            GPA: {edu.grade}
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
                <SectionTitle>Experience</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {experiences.map((exp, index) => (
                    <motion.div
                      key={index}
                      className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-gray-700 group transition-all duration-300 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-2"
                      viewport={{ once: true }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-cyan-500/10 dark:bg-cyan-500/5 rounded-lg p-3 text-cyan-500 dark:text-cyan-400">
                          {renderIcon("Building", 24)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                {exp.role}
                              </h3>
                              <p className="text-cyan-600 dark:text-cyan-400 font-medium">
                                {exp.company}
                              </p>
                            </div>
                            <span className="text-sm text-slate-500 dark:text-gray-400 whitespace-nowrap">
                              {exp.period}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-gray-400 text-sm mb-4">
                            {exp.type}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {exp.skills.map((skill) => (
                              <span
                                key={skill}
                                className="bg-slate-200/70 dark:bg-slate-700/50 text-xs text-cyan-700 dark:text-cyan-300 py-1 px-3 rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatedSection>
            </section>{" "}
            {/* Projects Section */}
            <section id="projects" className="py-20">
              <AnimatedSection>
                <SectionTitle>Featured Projects</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {projects.map((proj, index) => (
                    <motion.div
                      key={index}
                      className="bg-slate-100 dark:bg-slate-800/50 rounded-xl overflow-hidden border border-slate-200 dark:border-gray-700 group transition-all duration-300 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-2 flex flex-col"
                      viewport={{ once: true }}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="p-6 flex-grow">
                        {" "}
                        <div className="text-cyan-500 dark:text-cyan-400 mb-4">
                          {renderIcon(proj.icon, 40) ||
                            renderIcon("Building", 40)}
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                          {proj.name}
                        </h3>
                        <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 mb-3">
                          {proj.role}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-gray-400 mb-4 flex-grow">
                          {proj.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {proj.tech.map((t) => (
                            <span
                              key={t}
                              className="bg-slate-200 dark:bg-gray-700 text-xs text-cyan-700 dark:text-cyan-300 py-1 px-3 rounded-full"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-6 bg-slate-200/50 dark:bg-slate-900/50">
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-600 dark:text-cyan-400 font-semibold text-sm flex items-center group-hover:underline"
                        >
                          {" "}
                          <span>View Project</span>{" "}
                          <span className="ml-2">
                            {renderIcon("ExternalLink", 14)}
                          </span>
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatedSection>
            </section>
            {/* Skills & Certifications Section */}
            <section id="skills" className="py-20">
              <div className="grid md:grid-cols-2 gap-16">
                <AnimatedSection>
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-gray-100 mb-8 text-center">
                    Core Competencies
                  </h2>
                  <div className="space-y-6">
                    {skills.map((skill, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          {" "}
                          <span className="font-bold text-slate-800 dark:text-white flex items-center">
                            {" "}
                            <span className="mr-3">
                              {renderIcon(skill.icon) || renderIcon("Code", 24)}
                            </span>
                            <span>{skill.name}</span>
                          </span>
                          <span className="text-sm text-cyan-600 dark:text-cyan-400">
                            {skill.level}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-2.5">
                          <motion.div
                            className="bg-cyan-500 h-2.5 rounded-full"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level}%` }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 1.5,
                              ease: "easeOut",
                              delay: 0.2,
                            }}
                          ></motion.div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AnimatedSection>
                <CertificationsSection />
              </div>
            </section>
            {/* Contact Section */}
            <section id="contact" className="py-20 text-center">
              <AnimatedSection>
                <SectionTitle>Get In Touch</SectionTitle>
                <p className="max-w-xl mx-auto text-slate-600 dark:text-gray-400 mb-8">
                  I'm currently open to new opportunities and collaborations.
                  Feel free to reach out if you have a project in mind or just
                  want to connect!
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
                <a
                  href={`mailto:${userProfile.contact.email}`}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition-transform duration-300 hover:scale-105 inline-block shadow-lg shadow-cyan-500/20"
                >
                  Say Hello
                </a>
              </AnimatedSection>
            </section>
          </main>
          <footer className="py-8 border-t border-slate-200 dark:border-gray-800">
            <div className="container mx-auto px-6 text-center text-slate-500 dark:text-gray-500 text-sm">
              <p>
                &copy; {new Date().getFullYear()} {userProfile.name}. Designed &
                Built with ❤️.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default PortfolioContent;
