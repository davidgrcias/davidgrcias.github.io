// src/data/experiences.js
import { translateObject } from "../contexts/TranslationContext";
import { getCollection } from "../services/firestore";

const experiencesBase = [
  {
    role: "Coordinator of Web Division (Full Stack Developer)",
    company: "UMN FESTIVAL 2025",
    type: "Contract",
    location: "Tangerang, Banten, Indonesia",
    locationType: "Hybrid",
    description: "Led the end-to-end development of UMN Festival's official website using Laravel, React, and Midtrans, building a fully dynamic platform for managing events, announcements, and committee access.",
    skills: ["Laravel", "React.js", "Payment Gateways"],
    media: {
      type: "pdf",
      url: "/umnfest2025.pdf",
      thumbnail: "/umnfest.png",
      title: "UMN Festival 2025 — UNIFY Ticketing Flow & Admin Dashboard",
      description: "Screens from the end-to-end ticketing system for UNIFY 2025"
    },
    startDate: "2025-02",
    endDate: "present",
  },
  {
    role: "Full Stack Developer",
    company: "Koperasi Mikrolet Jakarta Raya (Komilet) — JakLingko Angkot Operator",
    type: "Contract",
    location: "Jakarta Metropolitan Area",
    locationType: "Remote",
    description: "Built and deployed a full-stack TypeScript platform for Koperasi Mikrolet Jakarta Raya (Komilet)—a JakLingko (Jakarta Integrated Transport System) angkot operator—to digitize end-to-end internal operations across drivers, vehicle owners, admin staff, and management.",
    skills: ["Full-Stack Development", "Web Technologies", "Node.js", "TypeScript", "PostgreSQL", "Prisma ORM"],
    media: {
      type: "image",
      url: "https://komilet.id",
      thumbnail: "/komilet.png",
      title: "Aplikasi Komilet",
      description: "Full-stack application for JakLingko angkot operator management system"
    },
    startDate: "2025-07",
    endDate: "present",
  },
  {
    role: "Founder, Digital Strategist & Web Developer",
    company: "Rental Mobil City Park",
    type: "Self-employed",
    location: "Tangerang, Banten, Indonesia",
    locationType: "Hybrid",
    description: "Founded and developed the web interface for a local car rental business, while also helping establish its online presence and digital marketing strategy.",
    skills: ["HTML", "CSS", "JavaScript", "Digital Marketing"],
    startDate: "2024-06",
    endDate: "present",
  },
  {
    role: "Web Developer",
    company: "DAAI TV",
    type: "Internship",
    location: "Jakarta, Indonesia",
    locationType: "On-site",
    description: "Completed a web development internship, working on frontend and backend development using PHP, MySQL, and Bootstrap.",
    skills: ["HTML", "Bootstrap", "PHP", "MySQL", "JavaScript"],
    startDate: "2022-03",
    endDate: "2022-05",
  },
];

let cachedExperiences = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000;

export const getExperiences = async (currentLanguage = "en") => {
  if (cachedExperiences && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    return translateData(cachedExperiences, currentLanguage);
  }

  try {
    const firestoreData = await getCollection('experiences', { orderByField: 'order' });
    if (firestoreData && firestoreData.length > 0) {
      cachedExperiences = firestoreData;
      cacheTimestamp = Date.now();
      return translateData(firestoreData, currentLanguage);
    }
  } catch (error) {
    console.warn('Failed to fetch experiences from Firestore, using fallback:', error);
  }
  
  return translateData(experiencesBase, currentLanguage);
};

export const getExperiencesSync = (currentLanguage = "en") => {
  if (cachedExperiences) {
    return translateData(cachedExperiences, currentLanguage);
  }
  return translateData(experiencesBase, currentLanguage);
};

const translateData = (data, language) => {
  if (language === "en") return data;
  return translateObject(data, language);
};

getExperiences().catch(() => {});

export default experiencesBase;
