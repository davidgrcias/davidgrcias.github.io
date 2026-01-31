// src/data/userProfile.js
import { translateObject } from "../contexts/TranslationContext";
import { getDocument } from "../services/firestore";

const userProfileBase = {
  name: "David Garcia Saragih",
  headline: "Full-Stack Web & Systems Engineer · Content Creator",
  photoUrl: "/profilpict.webp",
  aboutText:
    "I'm driven by curiosity and the excitement of learning something new, especially when it comes to technology. What started as a hobby has grown into a habit of building, exploring, and bringing ideas to life through code and creativity",
  contact: {
    email: "davidgarciasaragih7@gmail.com",
    location: "Jakarta, Indonesia",
    whatsapp: "+6287776803957",
  },
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

export const getUserProfile = async (currentLanguage = "en") => {
  if (cachedProfile && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    return translateData(cachedProfile, currentLanguage);
  }

  try {
    const firestoreData = await getDocument('profile', 'main');
    if (firestoreData && firestoreData.name) {
      cachedProfile = firestoreData;
      cacheTimestamp = Date.now();
      return translateData(firestoreData, currentLanguage);
    }
  } catch (error) {
    console.warn('Failed to fetch profile from Firestore, using fallback:', error);
  }
  
  return translateData(userProfileBase, currentLanguage);
};

export const getUserProfileSync = (currentLanguage = "en") => {
  if (cachedProfile) {
    return translateData(cachedProfile, currentLanguage);
  }
  return translateData(userProfileBase, currentLanguage);
};

const translateData = (data, language) => {
  if (language === "en") return data;
  return translateObject(data, language);
};

getUserProfile().catch(() => {});
