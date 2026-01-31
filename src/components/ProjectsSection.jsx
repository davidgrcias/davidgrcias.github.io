import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getProjects } from "../data/projects";
import { getUserProfile } from "../data/userProfile";
import * as LucideIcons from "lucide-react";
import SectionTitle from "./SectionTitle";
import { useTranslation } from "../contexts/TranslationContext";
import TiltCard from "./TiltCard";
import ProjectCarousel from "./ProjectCarousel";

const ProjectsSection = () => {
  const { currentLanguage, translateText } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("All");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [showAll, setShowAll] = useState(false);
  const PROJECTS_PER_PAGE = 6; // 3 rows × 2 columns

  // Load data from Firestore
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [projectsData, profileData] = await Promise.all([
          getProjects(currentLanguage),
          getUserProfile(currentLanguage)
        ]);
        setProjects(projectsData);
        setUserProfile(profileData);
        setFilteredProjects(projectsData);
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentLanguage]);

  const tabs = [
    {
      id: "All",
      label: translateText("All Projects", currentLanguage),
      icon: "Layout",
    },
    {
      id: "Beginner",
      label: translateText("Beginner", currentLanguage),
      icon: "GraduationCap",
    },
    {
      id: "Intermediate",
      label: translateText("Intermediate", currentLanguage),
      icon: "Code2",
    },
    {
      id: "Advanced",
      label: translateText("Advanced", currentLanguage),
      icon: "Cpu",
    },
    {
      id: "Real-World",
      label: translateText("Real-World", currentLanguage),
      icon: "Briefcase",
    },
    {
      id: "Capstone",
      label: translateText("Capstone", currentLanguage),
      icon: "Trophy",
    },
    {
      id: "Experimental",
      label: translateText("Experimental", currentLanguage),
      icon: "FlaskConical",
    },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const monthName = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    const translatedMonth = translateText(monthName, currentLanguage);
    return `${translatedMonth} ${year}`;
  };

  useEffect(() => {
    let filtered =
      activeTab === "All"
        ? [...projects]
        : projects.filter((project) => project.tiers.includes(activeTab));

    // Sort projects
    filtered.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.date) - new Date(a.date);
      } else {
        return new Date(a.date) - new Date(b.date);
      }
    });

    setFilteredProjects(filtered);
  }, [activeTab, sortOrder]);

  const visibleProjects = showAll
    ? filteredProjects
    : filteredProjects.slice(0, PROJECTS_PER_PAGE);
  const hasMoreProjects = filteredProjects.length > PROJECTS_PER_PAGE;

  const renderIcon = (iconName, className = "") => {
    const IconComponent = LucideIcons[iconName];
    return IconComponent ? (
      <IconComponent className={className} size={20} />
    ) : null;
  };

  // Calculate dynamic stats
  const totalProjects = projects.length;
  const openSourceCount = projects.filter(p => p.link && !p.link.includes('#')).length;
  const tierCounts = projects.reduce((acc, project) => {
    project.tiers?.forEach(tier => {
      acc[tier] = (acc[tier] || 0) + 1;
    });
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="w-full text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">{translateText("Loading projects...", currentLanguage)}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <SectionTitle>{translateText("Projects", currentLanguage)}</SectionTitle>
      <p className="text-center text-slate-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
        {translateText(
          "From beginner-friendly to real-world applications, explore my journey through different project tiers",
          currentLanguage
        )}
      </p>

      {/* Dynamic Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{totalProjects}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{translateText("Total Projects", currentLanguage)}</div>
        </div>
        <div className="bg-gradient-to-br from-teal-500/10 to-green-500/10 dark:from-teal-500/20 dark:to-green-500/20 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">{openSourceCount}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{translateText("Open Source", currentLanguage)}</div>
        </div>
        <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">{tierCounts['Real-World'] || 0}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{translateText("Real-World", currentLanguage)}</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{tierCounts['Advanced'] || 0}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{translateText("Advanced", currentLanguage)}</div>
        </div>
      </div>

      {/* 3D Carousel Showcase - Featured Projects - Very Compact */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center flex items-center justify-center gap-2">
          <span className="text-cyan-500">{renderIcon("Star")}</span>
          {translateText("Featured Projects", currentLanguage)}
        </h3>
        <ProjectCarousel
          projects={projects.filter((p) =>
            [
              "Komilet (JakLingko Management System)",
              "UMN Festival 2025 (Official Platform)",
            ].includes(p.name)
          )}
        />
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        {/* Project Type Tabs */}
        <div className="flex flex-wrap gap-2 justify-center flex-1">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-300 transform hover:scale-105
                ${
                  activeTab === tab.id
                    ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
                }
              `}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {renderIcon(tab.icon)}
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Sort Button */}
        <motion.button
          onClick={() =>
            setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
          }
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all duration-300"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          {renderIcon(sortOrder === "newest" ? "ArrowDown" : "ArrowUp")}
          {translateText(
            sortOrder === "newest" ? "Newest First" : "Oldest First",
            currentLanguage
          )}
        </motion.button>
      </div>
      {/* Projects Grid with Animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleProjects.map((project, index) => (
          <div
            key={`${project.name}-${index}`}
            className="h-full"
          >
            <div className="h-full relative bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg transition-all duration-300">
              {/* Project Date */}
              <div className="absolute top-6 right-16 text-sm text-slate-500 dark:text-slate-400">
                {formatDate(project.date)}
              </div>
              {/* Project Icon */}
              <div className="absolute top-6 right-6">
                {renderIcon(project.icon, "w-6 h-6 text-cyan-500")}
              </div>
              {/* Project Tiers Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                    {project.tiers.map((tier) => (
                      <span
                        key={tier}
                        className={`text-xs px-2 py-1 rounded-full ${
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
            {/* Rest of Project Content */}
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              {project.name}
            </h3>
            <p className="text-sm font-medium text-cyan-500 dark:text-cyan-400 mb-3">
              {project.role}
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tech.map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>{" "}
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-cyan-500 hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
            >
              {translateText("View Project", currentLanguage)}{" "}
              {renderIcon("ArrowUpRight")}
            </a>
            </div>
          </div>
        ))}
      </div>
      {/* Additional Projects Note - Show when all projects are displayed */}
      {showAll && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 text-center"
        >
          {" "}
          <p className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            {translateText("Too many to list!", currentLanguage)}
          </p>
          <p className="text-slate-600 dark:text-gray-400 mb-4">
            {translateText(
              "I've worked on a wide variety of projects, more than I could fit here.",
              currentLanguage
            )}
          </p>
          <p className="text-slate-600 dark:text-gray-400 mb-8">
            👉 {translateText("Check out more on", currentLanguage)}{" "}
            <a
              href={userProfile?.socials?.github?.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#333] dark:text-white hover:text-[#2b3137] dark:hover:text-gray-300 font-semibold transition-colors hover:underline underline-offset-4"
            >
              GitHub
            </a>
            ,{" "}
            <a
              href={userProfile?.socials?.youtube?.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF0000] hover:text-[#FF0000]/80 font-semibold transition-colors hover:underline underline-offset-4"
            >
              YouTube
            </a>
            {translateText(", or", currentLanguage)}{" "}
            <a
              href={userProfile?.socials?.tiktok?.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#000000] dark:text-white hover:text-[#00f2ea] dark:hover:text-[#00f2ea] font-semibold transition-colors hover:underline underline-offset-4"
            >
              TikTok
            </a>{" "}
            {translateText("to see the full journey.", currentLanguage)}
          </p>
        </motion.div>
      )}
      {/* Show More/Less Button */}
      {hasMoreProjects && (
        <div className="mt-8 text-center">
          <motion.button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/20"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            {" "}
            {showAll ? (
              <>
                {renderIcon("ChevronUp")}
                {translateText("Show Less Projects", currentLanguage)}
              </>
            ) : (
              <>
                {renderIcon("ChevronDown")}
                {translateText("Show More Projects", currentLanguage)}
              </>
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default ProjectsSection;
