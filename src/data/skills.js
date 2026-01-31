// src/data/skills.js
import { translateObject } from "../contexts/TranslationContext";
import { getDocument } from "../services/firestore";

const skillsBase = {
  technical: [
    {
      category: "Front-End",
      skills: ["HTML", "CSS", "Tailwind CSS", "JavaScript & TypeScript", "React.js", "UI/UX Implementation"],
      icon: "Layout"
    },
    {
      category: "Back-End",
      skills: ["PHP", "Laravel", "Node.js (TypeScript)", "PostgreSQL", "Prisma ORM", "MySQL", "REST API", "Auth & Session", "MVC", "Python", "Kotlin", "Java"],
      icon: "Database"
    },
    {
      category: "DevOps & Deployment",
      skills: ["Git & GitHub", "Firebase", "Vercel", "cPanel Hosting", "Chrome DevTools", "Nginx"],
      icon: "Server"
    },
    {
      category: "AI & Optimization Tools",
      skills: ["Google Analytics", "Google Search Console", "SEO Optimization", "Prompt Engineering"],
      icon: "Brain"
    },
    {
      category: "Others",
      skills: ["Docs Writing", "Canva", "Figma", "Mobile-First Development", "Continually learning new technologies"],
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

let cachedSkills = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000;

export const getSkills = async (currentLanguage = "en") => {
  if (cachedSkills && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    return translateData(cachedSkills, currentLanguage);
  }

  try {
    const firestoreData = await getDocument('skills', 'main');
    if (firestoreData && firestoreData.technical) {
      cachedSkills = firestoreData;
      cacheTimestamp = Date.now();
      return translateData(firestoreData, currentLanguage);
    }
  } catch (error) {
    console.warn('Failed to fetch skills from Firestore, using fallback:', error);
  }
  
  return translateData(skillsBase, currentLanguage);
};

export const getSkillsSync = (currentLanguage = "en") => {
  if (cachedSkills) {
    return translateData(cachedSkills, currentLanguage);
  }
  return translateData(skillsBase, currentLanguage);
};

const translateData = (data, language) => {
  if (language === "en") return data;
  return translateObject(data, language);
};

getSkills().catch(() => {});

export default skillsBase;
