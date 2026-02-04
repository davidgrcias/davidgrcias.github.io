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
    // Ensure CV URL exists
    cvUrl: data.cvUrl || userProfileBase.cvUrl,
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

const STORAGE_KEY = 'webos-user-profile';
const STORAGE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export const getUserProfile = async (currentLanguage = "en") => {
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

  try {
    // 3. Fetch from Firestore (Timeout increased to 10s)
    const firestoreData = await withTimeout(
      getDocument('profile', 'main'),
      10000
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
    // Silent fail for timeout or network error, just use fallback
    if (error.message !== 'Request timed out') {
      console.warn('Failed to fetch profile from Firestore, using fallback:', error);
    }
  }

  // 4. Fallback to Local Base
  // If we have stale data in storage, maybe use that instead of base? 
  // But for now, base is safe default.
  return translateData(normalizeProfile(userProfileBase), currentLanguage);
};

export const getUserProfileSync = (currentLanguage = "en") => {
  if (cachedProfile) {
    return translateData(normalizeProfile(cachedProfile), currentLanguage);
  }
  return translateData(normalizeProfile(userProfileBase), currentLanguage);
};

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
