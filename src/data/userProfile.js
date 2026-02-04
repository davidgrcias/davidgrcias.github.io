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

export const getUserProfile = async (currentLanguage = "en") => {
  if (cachedProfile && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    return translateData(normalizeProfile(cachedProfile), currentLanguage);
  }

  try {
    // Timeout set to 1.5 seconds - if Firestore is slow, fallback to local quickly
    const firestoreData = await withTimeout(
      getDocument('profile', 'main'),
      1500
    );

    if (firestoreData && firestoreData.name) {
      cachedProfile = firestoreData;
      cacheTimestamp = Date.now();
      return translateData(normalizeProfile(firestoreData), currentLanguage);
    }
  } catch (error) {
    // Silent fail for timeout or network error, just use fallback
    if (error.message !== 'Request timed out') {
      console.warn('Failed to fetch profile from Firestore, using fallback:', error);
    }
  }

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
