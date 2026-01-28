// src/data/skills.js
import { translateObject } from "../contexts/TranslationContext";

const skillsBase = {
  technical: [
    {
      category: "Front-End",
      skills: [
        "HTML",
        "CSS",
        "Tailwind CSS",
        "JavaScript & TypeScript",
        "React.js",
        "UI/UX Implementation"
      ],
      icon: "Layout"
    },
    {
      category: "Back-End",
      skills: [
        "PHP",
        "Laravel",
        "Node.js (TypeScript)",
        "PostgreSQL",
        "Prisma ORM",
        "MySQL",
        "REST API",
        "Auth & Session",
        "MVC",
        "Python",
        "Kotlin",
        "Java"
      ],
      icon: "Database"
    },
    {
      category: "DevOps & Deployment",
      skills: [
        "Git & GitHub",
        "Firebase",
        "Vercel",
        "cPanel Hosting",
        "Chrome DevTools",
        "Nginx"
      ],
      icon: "Server"
    },
    {
      category: "AI & Optimization Tools",
      skills: [
        "Google Analytics",
        "Google Search Console",
        "SEO Optimization",
        "Prompt Engineering"
      ],
      icon: "Brain"
    },
    {
      category: "Others",
      skills: [
        "Docs Writing",
        "Canva",
        "Figma",
        "Mobile-First Development",
        "Continually learning new technologies"
      ],
      icon: "Lightbulb"
    }
  ],
  soft: [
    "Problem Solving",
    "Critical Thinking",
    "Fast Learning",
    "Adaptability",
    "Creativity",
    "Digital Communication",
    "Initiative",
    "Strong Work Ethic",
    "Team Collaboration",
    "Curiosity-Driven",
    "Branding",
    "Resilience"
  ]
};

// Function to get translated skills based on current language
export const getSkills = (currentLanguage = "en") => {
  if (currentLanguage === "en") {
    return skillsBase;
  }
  return translateObject(skillsBase, currentLanguage);
};

export default skillsBase;
