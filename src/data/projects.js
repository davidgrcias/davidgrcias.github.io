// src/data/projects.js
import { translateObject } from "../contexts/TranslationContext";
import { getCollection } from "../services/firestore";

// Static fallback data
const projectsBase = [
  {
    name: "Komilet (JakLingko Management System)",
    role: "Full-Stack Web & Systems Engineer",
    description:
      "Architected a comprehensive fleet management system for JakLingko operators using Next.js 16 and PostgreSQL. Designed a dual-panel architecture (Admin/Home) handling 42+ database entities, featuring soft-delete patterns, granular RBAC permissions, and automated approval workflows for financial integrity.",
    tech: ["Next.js 16", "TypeScript", "PostgreSQL", "Prisma", "Tailwind CSS v4", "Redux Toolkit"],
    highlights: [
      "Engineered a secure App Router structure with Middleware-based JWT authentication and Role-Based Access Control (RBAC).",
      "Optimized 42+ table database schema using Composite Indexing and React Window virtualization for large datasets.",
      "Implemented a 'LogApproval' pattern to ensure strict audit trails for sensitive financial operations.",
    ],
    link: "#",
    icon: "Bus",
    tiers: ["Advanced", "Real-World"],
    date: "2025-11",
  },
  {
    name: "UMN Festival 2025 (Official Platform)",
    role: "Web Development Coordinator",
    description:
      "Architected the comprehensive event platform for UMN Festival 2025 using a Hybrid Monolith approach (Laravel 12 + Inertia.js). The system handles end-to-end ticketing, from dynamic bundle pricing and referral tracking to real-time Midtrans payment synchronization and secure QR code check-in.",
    tech: ["Laravel 12", "React 19", "Inertia.js 2.0", "Tailwind CSS v4", "Midtrans SDK", "PostgreSQL"],
    highlights: [
      "Designed a Hybrid SSR/SPA architecture combining Laravel's robustness with React's interactivity via Inertia.js 2.0.",
      "Built a secure Ticket Validation System using SHA-256 hasing and 'Frame Capture' anti-replay protection for scanners.",
      "Implemented complex Order Workflows: Bundle discounts, referral tracking, and automated PDF ticket generation with QR codes.",
    ],
    link: "#",
    icon: "Ticket",
    tiers: ["Advanced", "Real-World", "Capstone"],
    date: "2025-11",
  },
  {
    name: "Ark Care Ministry Website",
    role: "Backend Developer & Project Coordinator",
    description:
      "Volunteered to build a website for a nonprofit organization, leading the team and developing the backend system to support dynamic activity listings, content management, and user communication.",
    tech: ["PHP", "Laravel", "MySQL"],
    highlights: [
      "Led a four-person volunteer squad to ship the MVP and onboarding flow on schedule.",
      "Built modular backend endpoints to power dynamic activity listings and CMS updates.",
      "Introduced secure messaging channels so staff and volunteers can coordinate quickly.",
    ],
    link: "https://arkcareministry.org/",
    icon: "Handshake",
    tiers: ["Advanced", "Real-World"],
    date: "2024-12",
  },
];

// Cache for fetched data
let cachedProjects = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Function to get projects (tries Firestore first, falls back to static)
export const getProjects = async (currentLanguage = "en") => {
  // Check cache
  if (cachedProjects && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    return translateData(cachedProjects, currentLanguage);
  }

  try {
    const firestoreData = await getCollection('projects', { orderByField: 'order' });
    
    if (firestoreData && firestoreData.length > 0) {
      cachedProjects = firestoreData;
      cacheTimestamp = Date.now();
      return translateData(firestoreData, currentLanguage);
    }
  } catch (error) {
    console.warn('Failed to fetch projects from Firestore, using fallback:', error);
  }
  
  // Fallback to static data
  return translateData(projectsBase, currentLanguage);
};

// Synchronous version for components that can't use async
export const getProjectsSync = (currentLanguage = "en") => {
  if (cachedProjects) {
    return translateData(cachedProjects, currentLanguage);
  }
  return translateData(projectsBase, currentLanguage);
};

// Helper to translate data
const translateData = (data, language) => {
  if (language === "en") return data;
  return translateObject(data, language);
};

// Initialize cache on module load
getProjects().catch(() => {});

export default projectsBase;
