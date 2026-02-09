// src/data/projects.js
import { translateObject } from "../contexts/TranslationContext";
import { getCollection } from "../services/firestore";

// Static fallback data
const projectsBase = [
  {
    name: "WebOS Portfolio & AI Agent",
    role: "Solo Project",
    description:
      "Futuristic OS simulation with a RAG-powered Gemini Agent for context-aware answers and autonomous UI control.",
    tech: ["React 19", "Gemini API", "Vector Search", "Tailwind CSS v4", "WebOS"],
    highlights: [
      "Architected a Desktop UI with window management, virtual filesystem, and voice interaction.",
      "Engineered a hybrid Agent merging Vector Search RAG with regex-based system automation.",
    ],
    link: "https://davidgrcias.github.io",
    icon: "Bot",
    tiers: ["Showcase", "AI Integration", "Advanced"],
    date: "2025-12",
  },
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

// Helper for timeout
const withTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms)
    )
  ]);
};

// Helper for retry with exponential backoff
const withRetry = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} for projects after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};

// Function to get projects (tries Firestore first, falls back to static)
export const getProjects = async (currentLanguage = "en") => {
  // Check cache
  if (cachedProjects && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    return translateData(cachedProjects, currentLanguage);
  }

  try {
    const firestoreData = await withRetry(
      () => withTimeout(
        getCollection('projects', { orderByField: 'order' }),
        30000 // 30 seconds for slow connections
      ),
      3, // 3 retry attempts
      1000 // Start with 1s delay
    );

    if (firestoreData && firestoreData.length > 0) {
      cachedProjects = firestoreData;
      cacheTimestamp = Date.now();
      return translateData(firestoreData, currentLanguage);
    }
  } catch (error) {
    console.error('Failed to fetch projects from Firestore after retries:', error);

    // Check if we should use emergency fallback (development mode only)
    const useEmergencyFallback = import.meta.env.VITE_USE_EMERGENCY_FALLBACK === 'true';

    if (useEmergencyFallback) {
      console.warn('Using emergency fallback projects (development mode)');
      return translateData(projectsBase, currentLanguage);
    }

    // In production, throw error to force component to handle loading/error states
    throw new Error(`Failed to load projects: ${error.message}`);
  }

  // Should never reach here
  throw new Error('Unexpected error loading projects');
};

// REMOVED: getProjectsSync - Use async getProjects instead
// Components should handle loading states properly instead of using sync fallback

// Helper to translate data
const translateData = (data, language) => {
  if (language === "en") return data;
  return translateObject(data, language);
};

// Initialize cache on module load
getProjects().catch(() => { });
