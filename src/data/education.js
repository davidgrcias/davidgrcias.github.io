// src/data/education.js
import { translateObject } from "../contexts/TranslationContext";
import { getCollection } from "../services/firestore";

const educationBase = [
  {
    degree: "Undergraduate Student, Informatics",
    institution: "Universitas Multimedia Nusantara",
    period: "2023 - 2027",
    grade: "3.87",
  },
  {
    degree: "Software Engineering",
    institution: "SMK Cinta Kasih Tzu Chi",
    period: "2020 - 2023",
  },
];

let cachedEducation = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000;

export const getEducation = async (language = "en") => {
  if (cachedEducation && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    return translateData(cachedEducation, language);
  }

  try {
    const firestoreData = await getCollection('education', { orderByField: 'order' });
    if (firestoreData && firestoreData.length > 0) {
      cachedEducation = firestoreData;
      cacheTimestamp = Date.now();
      return translateData(firestoreData, language);
    }
  } catch (error) {
    console.warn('Failed to fetch education from Firestore, using fallback:', error);
  }
  
  return translateData(educationBase, language);
};

export const getEducationSync = (language = "en") => {
  if (cachedEducation) {
    return translateData(cachedEducation, language);
  }
  return translateData(educationBase, language);
};

const translateData = (data, language) => {
  if (language === "en") return data;
  return translateObject(data, language);
};

getEducation().catch(() => {});

export default educationBase;
