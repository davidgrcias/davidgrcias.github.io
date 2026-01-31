// src/data/certifications.js
import { translateObject } from "../contexts/TranslationContext";
import { getCollection } from "../services/firestore";

const certificationsBase = [
  {
    name: "HCIA-AI V3.5 Course",
    provider: "Huawei ICT Academy",
    date: "May 2025",
    icon: "BrainCircuitIcon",
  },
  {
    name: "Python Intermediate Course",
    provider: "Sololearn",
    date: "June 2025",
    icon: "CodeIcon",
  },
  {
    name: "PHP Course",
    provider: "Progate",
    date: "Jan 2022",
    icon: "FileCode",
  },
  {
    name: "React Course",
    provider: "Progate",
    date: "Jan 2022",
    icon: "Code2",
  },
  {
    name: "SQL Course",
    provider: "Progate",
    date: "Jan 2022",
    icon: "Database",
  },
  {
    name: "Web Development Course",
    provider: "Progate",
    date: "Jan 2022",
    icon: "Globe",
  },
  {
    name: "GIT Course",
    provider: "Progate",
    date: "Dec 2021",
    icon: "GitBranch",
  },
  {
    name: "Startup of New Innovation Challenge",
    provider: "HIMPS-HI UPH",
    date: "Mar 2022",
    icon: "Award",
  },
];

let cachedCertifications = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000;

export const getCertifications = async (language = "en") => {
  if (cachedCertifications && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    return translateData(cachedCertifications, language);
  }

  try {
    const firestoreData = await getCollection('certifications', { orderByField: 'order' });
    if (firestoreData && firestoreData.length > 0) {
      cachedCertifications = firestoreData;
      cacheTimestamp = Date.now();
      return translateData(firestoreData, language);
    }
  } catch (error) {
    console.warn('Failed to fetch certifications from Firestore, using fallback:', error);
  }
  
  return translateData(certificationsBase, language);
};

export const getCertificationsSync = (language = "en") => {
  if (cachedCertifications) {
    return translateData(cachedCertifications, language);
  }
  return translateData(certificationsBase, language);
};

const translateData = (data, language) => {
  if (language === "en") return data;
  return translateObject(data, language);
};

getCertifications().catch(() => {});

export default certificationsBase;
