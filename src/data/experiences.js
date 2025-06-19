// src/data/experiences.js
import { translateObject } from "../contexts/TranslationContext";

const experiencesBase = [
  {
    role: "Coordinator of Web Development",
    company: "UMN Festival 2025",
    type: "Event Committee",
    skills: ["Laravel", "React", "Tailwind CSS", "Git Workflow"],
    startDate: "2025-02",
    endDate: "2025-11",
  },
  {
    role: "Founder, Digital Strategist & Web Developer",
    company: "Rental Mobil City Park",
    type: "Entrepreneurship",
    skills: ["HTML", "CSS", "JavaScript"],
    startDate: "2024-06",
    endDate: "present",
  },
  {
    role: "Frontend Developer",
    company: "UMN Visual Journalism Day 2024",
    type: "Event Committee",
    skills: ["TypeScript", "React", "Tailwind CSS", "Git Workflow"],
    startDate: "2024-06",
    endDate: "2024-10",
  },
  {
    role: "Frontend Developer",
    company: "PPIF UMN 2024",
    type: "Event Committee",
    skills: ["React", "Tailwind CSS", "Git Workflow"],
    startDate: "2024-04",
    endDate: "2024-08",
  },
  {
    role: "Backend Developer",
    company: "UMN Tech Festival 2024",
    type: "Event Committee",
    skills: ["Laravel", "PHP", "MySQL", "Git Workflow"],
    startDate: "2023-09",
    endDate: "2024-03",
  },
  {
    role: "Web Developer",
    company: "DAAI TV",
    type: "Internship",
    skills: ["HTML", "Bootstrap", "PHP", "MySQL", "JavaScript"],
    startDate: "2022-03",
    endDate: "2022-05",
  },
];

// Function to get translated experiences based on current language
export const getExperiences = (currentLanguage = "en") => {
  if (currentLanguage === "en") {
    return experiencesBase;
  }
  return translateObject(experiencesBase, currentLanguage);
};

export default experiencesBase;
