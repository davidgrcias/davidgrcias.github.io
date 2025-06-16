import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import projects from "../data/projects";
import * as LucideIcons from "lucide-react";
import SectionTitle from "./SectionTitle";

const ProjectsSection = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [filteredProjects, setFilteredProjects] = useState(projects);

  const tabs = [
    { id: "All", label: "All Projects", icon: "Layout" },
    { id: "Beginner", label: "Beginner", icon: "GraduationCap" },
    { id: "Intermediate", label: "Intermediate", icon: "Code2" },
    { id: "Advanced", label: "Advanced", icon: "Cpu" },
    { id: "Real-World", label: "Real-World", icon: "Briefcase" },
    { id: "Capstone", label: "Capstone", icon: "Trophy" },
  ];

  useEffect(() => {
    if (activeTab === "All") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(
        projects.filter((project) => project.tiers.includes(activeTab))
      );
    }
  }, [activeTab]);

  const renderIcon = (iconName, className = "") => {
    const IconComponent = LucideIcons[iconName];
    return IconComponent ? (
      <IconComponent className={className} size={20} />
    ) : null;
  };

  return (
    <div className="w-full">
      <SectionTitle>Projects</SectionTitle>
      <p className="text-center text-slate-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
        From beginner-friendly to real-world applications, explore my journey
        through different project tiers
      </p>

      {/* Innovative Tab Design */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
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

      {/* Projects Grid with Animation */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" layout>
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.name}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="group relative bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
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
                        : "bg-violet-100/80 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                    }`}
                  >
                    {tier}
                  </span>
                ))}
              </div>

              {/* Project Icon */}
              <div className="absolute top-6 right-6">
                {renderIcon(project.icon, "w-6 h-6 text-cyan-500")}
              </div>

              {/* Project Content */}
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                {project.name}
              </h3>
              <p className="text-sm font-medium text-cyan-500 dark:text-cyan-400 mb-3">
                {project.role}
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                {project.description}
              </p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Project Link */}
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-cyan-500 hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
              >
                View Project {renderIcon("ArrowUpRight")}
              </a>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ProjectsSection;
