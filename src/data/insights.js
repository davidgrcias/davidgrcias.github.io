// src/data/insights.js
import { translateObject } from "../contexts/TranslationContext";
import { getCollection } from "../services/firestore";

const insightsBase = [
  {
    title: "Motivation",
    text: "Fueled by ambition, not afraid to fail, because every setback is simply a setup for the next level.",
    icon: "Rocket",
  },
  {
    title: "Never Going Back",
    text: "I'll never return to being the shy and reserved person I once was. Now, I confidently embrace opportunities to speak and connect.",
    icon: "SkipBack",
  },
  {
    title: "What Keeps Me Curious",
    text: "I'm endlessly curious about how things work, whether complex systems or compelling stories. I'm driven by the 'why' and 'how' behind it all.",
    icon: "SearchCheck",
  },
  {
    title: "How I Stay Updated",
    text: "I actively stay informed and up-to-date on current events, tech trends, and global developments, constantly expanding my perspective and knowledge base.",
    icon: "Newspaper",
  },
];

let cachedInsights = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000;

export const getInsights = async (language = "en") => {
  if (cachedInsights && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    return translateData(cachedInsights, language);
  }

  try {
    const firestoreData = await getCollection('insights', { orderByField: 'order' });
    if (firestoreData && firestoreData.length > 0) {
      cachedInsights = firestoreData;
      cacheTimestamp = Date.now();
      return translateData(firestoreData, language);
    }
  } catch (error) {
    console.warn('Failed to fetch insights from Firestore, using fallback:', error);
  }
  
  return translateData(insightsBase, language);
};

export const getInsightsSync = (language = "en") => {
  if (cachedInsights) {
    return translateData(cachedInsights, language);
  }
  return translateData(insightsBase, language);
};

const translateData = (data, language) => {
  if (language === "en") return data;
  return translateObject(data, language);
};

getInsights().catch(() => {});

export default insightsBase;
