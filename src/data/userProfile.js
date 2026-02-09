// src/data/userProfile.js
import { translateObject } from "../contexts/TranslationContext";
import { getDocument } from "../services/firestore";

const userProfileBase = {
  name: "David Garcia Saragih",
  headline: "Full-Stack Web & Systems Engineer · Content Creator",
  // Aliases for frontend compatibility
  title: "Full-Stack Web & Systems Engineer · Content Creator",
  photoUrl: "https://placehold.co/400x400?text=David+Garcia",
  avatar: "/profilpict.webp",
  // CV is now HARDCODED for instant loading (no Firestore override)
  cvUrl: "/CV_DavidGarciaSaragih.pdf",
  aboutText:
    "I'm driven by curiosity and the excitement of learning something new, especially when it comes to technology. What started as a hobby has grown into a habit of building, exploring, and bringing ideas to life through code and creativity",
  bio: "I'm driven by curiosity and the excitement of learning something new, especially when it comes to technology. What started as a hobby has grown into a habit of building, exploring, and bringing ideas to life through code and creativity",
  // Status card fields
  status: "open", // 'open' | 'employed' | 'busy'
  availableFor: ["Full-time", "Freelance", "Contract"],
  // Contact
  contact: {
    email: "davidgarciasaragih7@gmail.com",
    location: "Jakarta, Indonesia",
    whatsapp: "+6287776803957",
  },
  email: "davidgarciasaragih7@gmail.com",
  location: "Jakarta, Indonesia",
  website: "davidgrcias.github.io",
  socials: {
    youtube: {
      url: "https://www.youtube.com/c/DavidGTech",
      handle: "@DavidGTech",
    },
    tiktok: {
      url: "https://www.tiktok.com/@davidgtech",
      handle: "@davidgtech",
    },
    github: { url: "https://github.com/davidgrcias", handle: "davidgrcias" },
    linkedin: {
      url: "https://www.linkedin.com/in/davidgrcias/",
      handle: "davidgrcias",
    },
    instagram: {
      url: "https://www.instagram.com/davidgrcias/",
      handle: "@davidgrcias",
    },
  },
};

let cachedProfile = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000;

// Normalize profile data to ensure frontend compatibility
const normalizeProfile = (data) => {
  return {
    ...data,
    // Ensure title/headline aliases work both ways
    title: data.title || data.headline,
    headline: data.headline || data.title,
    // Ensure bio/aboutText aliases work both ways
    bio: data.bio || data.aboutText,
    aboutText: data.aboutText || data.bio,
    // Map title to role if role missing
    role: data.role || data.title || data.headline,
    // Ensure avatar/photoUrl aliases work both ways
    avatar: data.avatar || data.photoUrl,
    photoUrl: data.photoUrl || data.avatar,
    // Ensure CV URL is ALWAYS local (hardcoded for performance)
    cvUrl: userProfileBase.cvUrl, // Force local path, ignore Firestore
    // Ensure flat email/location from contact
    email: data.email || data.contact?.email,
    location: data.location || data.contact?.location,
    // Status card defaults
    status: data.status || 'open',
    availableFor: data.availableFor || ['Full-time', 'Freelance'],
    // Website fallback
    website: data.website || userProfileBase.website,
    // Ensure socials exist
    socials: data.socials || userProfileBase.socials,
  };
};

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
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};

const STORAGE_KEY = 'webos-user-profile';
const STORAGE_TTL = 5 * 60 * 1000; // 5 minutes (reduced from 24h for better sync)

export const getUserProfile = async (currentLanguage = "en", forceRefresh = false) => {
  // Skip all caches if force refresh requested
  if (!forceRefresh) {
    // 1. Check Memory Cache
    if (cachedProfile && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
      return translateData(normalizeProfile(cachedProfile), currentLanguage);
    }

    // 2. Check LocalStorage Cache (Fastest persistent)
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { data, timestamp } = JSON.parse(saved);
        if (Date.now() - timestamp < STORAGE_TTL) {
          // Update memory cache
          cachedProfile = data;
          cacheTimestamp = Date.now();
          // Return immediately for speed, but trigger background refresh if needed? 
          // For now, trust storage to be fast.
          return translateData(normalizeProfile(data), currentLanguage);
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached profile', e);
    }
  } // Close if (!forceRefresh)

  // 3. Fetch from Firestore with retry (Timeout increased to 30s)
  try {
    const firestoreData = await withRetry(
      () => withTimeout(
        getDocument('profile', 'main'),
        30000 // 30 seconds for slow connections
      ),
      3, // 3 retry attempts
      1000 // Start with 1s delay
    );

    if (firestoreData && firestoreData.name) {
      cachedProfile = firestoreData;
      cacheTimestamp = Date.now();

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        data: firestoreData,
        timestamp: Date.now()
      }));

      return translateData(normalizeProfile(firestoreData), currentLanguage);
    }
  } catch (error) {
    console.error('Failed to fetch profile from Firestore after retries:', error);

    // Check if we should use emergency fallback (development mode only)
    const useEmergencyFallback = import.meta.env.VITE_USE_EMERGENCY_FALLBACK === 'true';

    if (useEmergencyFallback) {
      console.warn('Using emergency fallback data (development mode)');
      return translateData(normalizeProfile(userProfileBase), currentLanguage);
    }

    // In production, throw error to force component to handle loading/error states
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  // Should never reach here, but TypeScript needs a return
  throw new Error('Unexpected error loading profile');
};

// REMOVED: getUserProfileSync - Use async getUserProfile instead
// Components should handle loading states properly instead of using sync fallback

// Clear cache to force re-fetch
export const clearProfileCache = () => {
  cachedProfile = null;
  cacheTimestamp = null;
};

const translateData = (data, language) => {
  if (language === "en") return data;
  return translateObject(data, language);
};

getUserProfile().catch(() => { });
