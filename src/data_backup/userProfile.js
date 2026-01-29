// src/data/userProfile.js
import { translateObject } from "../contexts/TranslationContext";

const userProfileBase = {
  name: "David Garcia Saragih",
  headline: "Full-Stack Web & Systems Engineer · Content Creator",
  photoUrl: "/profilpict.webp",
  aboutText:
    "I’m driven by curiosity and the excitement of learning something new, especially when it comes to technology. What started as a hobby has grown into a habit of building, exploring, and bringing ideas to life through code and creativity",
  contact: {
    email: "davidgarciasaragih7@gmail.com",
    location: "Jakarta, Indonesia",
    whatsapp: "+6287776803957", // Added WhatsApp number with country code
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

// Function to get translated user profile based on current language
export const getUserProfile = (currentLanguage = "en") => {
  if (currentLanguage === "en") {
    return userProfileBase;
  }
  return translateObject(userProfileBase, currentLanguage);
};

export default userProfileBase;
