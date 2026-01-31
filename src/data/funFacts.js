// src/data/funFacts.js
import { translateObject } from "../contexts/TranslationContext";
import { getCollection } from "../services/firestore";

const funFactsBase = [
  {
    title: "Hidden Talent",
    text: "Ask me about Jakarta's transport routes, I can tell you the best way to reach any destination using public transport!",
    icon: "MapIcon",
  },
  {
    title: "Surprising Fact",
    text: "Though I might seem reserved at first, I genuinely love meeting and chatting with new people.",
    icon: "HeartHandshake",
  },
  {
    title: "Most Productive Hours",
    text: "Late night hours are when my creativity and productivity peak.",
    icon: "Hourglass",
  },
  {
    title: "Best Way to Relax",
    text: "Nothing beats unwinding after a productive day of solving complex coding challenges.",
    icon: "Puzzle",
  },
  {
    title: "Friends Describe Me As",
    text: "Ambitious and analytical, I love digging deeper into things and always strive to improve.",
    icon: "User",
  },
  {
    title: "Underrated Joy",
    text: "That satisfying moment when I successfully help someone solve a problem or reach their goal.",
    icon: "Heart",
  },
];

let cachedFunFacts = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000;

export const getFunFacts = async (currentLanguage = "en") => {
  if (cachedFunFacts && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    return translateData(cachedFunFacts, currentLanguage);
  }

  try {
    const firestoreData = await getCollection('funFacts', { orderByField: 'order' });
    if (firestoreData && firestoreData.length > 0) {
      cachedFunFacts = firestoreData;
      cacheTimestamp = Date.now();
      return translateData(firestoreData, currentLanguage);
    }
  } catch (error) {
    console.warn('Failed to fetch funFacts from Firestore, using fallback:', error);
  }
  
  return translateData(funFactsBase, currentLanguage);
};

export const getFunFactsSync = (currentLanguage = "en") => {
  if (cachedFunFacts) {
    return translateData(cachedFunFacts, currentLanguage);
  }
  return translateData(funFactsBase, currentLanguage);
};

const translateData = (data, language) => {
  if (language === "en") return data;
  return translateObject(data, language);
};

getFunFacts().catch(() => {});

export default funFactsBase;
