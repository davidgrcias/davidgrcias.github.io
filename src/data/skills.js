// src/data/skills.js
import { translateObject } from "../contexts/TranslationContext";

const skillsBase = [
  {
    name: "HTML, CSS, Bootstrap & Tailwind",
    level: 100,
    icon: "Code",
  },
  { name: "JavaScript & TypeScript", level: 95, icon: "Code" },
  { name: "React.js", level: 95, icon: "Code" },
  { name: "Backend (PHP, Laravel, MySQL)", level: 95, icon: "Database" },
  { name: "Python", level: 50, icon: "Code" },
  { name: "Git & Version Control", level: 85, icon: "GitBranch" },
  { name: "SEO (Search Engine Optimization)", level: "90", icon: "Search" },
  { name: "API Integration & RESTful Services", level: "90", icon: "Cloud" },
  { name: "UI Implementation & Design-to-Code", level: "90", icon: "Layout" },
  { name: "Deployment & Hosting", level: "90", icon: "Server" },
];

// Function to get translated skills based on current language
export const getSkills = (currentLanguage = "en") => {
  if (currentLanguage === "en") {
    return skillsBase;
  }
  return translateObject(skillsBase, currentLanguage);
};

export default skillsBase;
