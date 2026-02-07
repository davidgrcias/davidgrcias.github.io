// src/data/additionalInfo.js
// Additional personal info about David that isn't covered by other data files.
// This supplements the AI chatbot's knowledge with personal details, preferences, etc.
// The AI uses this as context to answer casual/personal questions about David.

import { translateObject } from "../contexts/TranslationContext";
import { getCollection } from "../services/firestore";

const additionalInfoBase = [
  {
    category: "Physical & Personal",
    items: [
      { label: "Height", value: "175 cm", context: "David is 175 cm tall." },
      { label: "Date of Birth", value: "July 7, 2004", context: "David was born on July 7, 2004. He's a Cancer zodiac sign." },
      { label: "Nationality", value: "Indonesian", context: "David is Indonesian, born and raised in Jakarta." },
      { label: "Languages Spoken", value: "Indonesian, English", context: "David speaks Indonesian natively and is fluent in English." },
    ],
  },
  {
    category: "Music & Entertainment",
    items: [
      { label: "Favorite Music Genre", value: "J-Pop, City Pop, Lo-Fi", context: "David loves Japanese music (J-Pop and City Pop) and often listens to Lo-Fi while coding." },
      { label: "Favorite Artists", value: "Placeholder — edit this!", context: "Edit this with David's actual favorite artists." },
      { label: "Favorite Movies/Anime", value: "Placeholder — edit this!", context: "Edit this with David's favorite movies or anime." },
    ],
  },
  {
    category: "Lifestyle & Preferences",
    items: [
      { label: "Favorite Food", value: "Placeholder — edit this!", context: "Edit this with David's favorite food." },
      { label: "Hobbies", value: "Coding, Gaming, Content Creation", context: "Besides coding, David enjoys gaming and creating content for YouTube and TikTok." },
      { label: "Favorite IDE", value: "VS Code", context: "David's favorite IDE is Visual Studio Code. He even built his portfolio to look like an OS with a VS Code app inside it." },
      { label: "Operating System", value: "Windows 11", context: "David uses Windows 11 as his main operating system for development." },
      { label: "Coffee or Tea", value: "Placeholder — edit this!", context: "Edit this with David's preference." },
    ],
  },
  {
    category: "Fun & Random",
    items: [
      { label: "Favorite Color", value: "Placeholder — edit this!", context: "Edit this with David's favorite color." },
      { label: "Dream Destination", value: "Placeholder — edit this!", context: "Edit this with David's dream travel destination." },
      { label: "Pet Peeve", value: "Placeholder — edit this!", context: "Edit this with something David finds annoying." },
      { label: "Life Motto", value: "Placeholder — edit this!", context: "Edit this with David's personal motto or life philosophy." },
    ],
  },
  {
    category: "Relationship & Social",
    items: [
      { label: "Relationship Status", value: "Placeholder — edit this!", context: "Edit this with current status or remove if you don't want to share." },
      { label: "Crush", value: "Placeholder — edit this!", context: "Edit this with detail or remove if private." },
      { label: "Best Quality in a Person", value: "Placeholder — edit this!", context: "Edit this — what David values most in people." },
    ],
  },
];

// Cache
let cachedAdditionalInfo = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000;

export const getAdditionalInfo = async (currentLanguage = "en") => {
  if (cachedAdditionalInfo && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    return translateData(cachedAdditionalInfo, currentLanguage);
  }

  try {
    const firestoreData = await getCollection('additionalInfo', { orderByField: 'order' });
    if (firestoreData && firestoreData.length > 0) {
      cachedAdditionalInfo = firestoreData;
      cacheTimestamp = Date.now();
      return translateData(firestoreData, currentLanguage);
    }
  } catch (error) {
    console.warn('Failed to fetch additionalInfo from Firestore, using fallback:', error);
  }

  return translateData(additionalInfoBase, currentLanguage);
};

export const getAdditionalInfoSync = (currentLanguage = "en") => {
  if (cachedAdditionalInfo) {
    return translateData(cachedAdditionalInfo, currentLanguage);
  }
  return translateData(additionalInfoBase, currentLanguage);
};

const translateData = (data, language) => {
  if (language === "en") return data;
  return translateObject(data, language);
};

// Pre-fetch
getAdditionalInfo().catch(() => {});

export default additionalInfoBase;
