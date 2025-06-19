// src/data/education.js
import { translateObject } from "../contexts/TranslationContext";

const educationData = [
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

// Function to get translated education based on current language
export const getEducation = (language = "en") => {
  return translateObject(educationData, language);
};

// Default export for backward compatibility
export default educationData;
