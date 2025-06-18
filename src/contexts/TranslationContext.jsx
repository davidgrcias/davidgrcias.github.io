// src/contexts/TranslationContext.jsx
import React, { createContext, useContext, useState } from "react";

const TranslationContext = createContext();

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
};

// Translation service using Google Translate (free web scraping method)
const translateText = async (text, targetLang) => {
  if (targetLang === "en" || !text || typeof text !== "string") return text;

  try {
    // Using Google Translate free web API
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      text
    )}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }
    return text;
  } catch (error) {
    console.error("Translation error:", error);
    // Fallback: Simple word replacements for Indonesian
    if (targetLang === "id") {
      return translateToIndonesianFallback(text);
    }
    return text;
  }
};

// Fallback translation with manual dictionary for key terms
const translateToIndonesianFallback = (text) => {
  const translations = {
    // Navigation & General
    About: "Tentang",
    Experience: "Pengalaman",
    Projects: "Proyek",
    Skills: "Keahlian",
    Contact: "Kontak",
    Home: "Beranda",
    Portfolio: "Portofolio",

    // Technical Skills
    "Frontend Developer": "Pengembang Frontend",
    "Backend Developer": "Pengembang Backend",
    "Full Stack Developer": "Pengembang Full Stack",
    "Web Developer": "Pengembang Web",
    "Software Engineer": "Insinyur Perangkat Lunak",
    Programming: "Pemrograman",
    Development: "Pengembangan",
    Technology: "Teknologi",
    Database: "Basis Data",
    JavaScript: "JavaScript",
    TypeScript: "TypeScript",
    React: "React",
    Vue: "Vue",
    Angular: "Angular",
    "Node.js": "Node.js",
    Laravel: "Laravel",
    PHP: "PHP",
    Python: "Python",
    HTML: "HTML",
    CSS: "CSS",
    "Tailwind CSS": "Tailwind CSS",

    // Common phrases
    Hello: "Halo",
    Welcome: "Selamat Datang",
    "Thank you": "Terima kasih",
    "Contact me": "Hubungi saya",
    "View Project": "Lihat Proyek",
    "Download CV": "Unduh CV",
    "Hire Me": "Rekrut Saya",
    "Get in Touch": "Hubungi Kami",
    "Learn More": "Pelajari Lebih Lanjut",
    "Read More": "Baca Selengkapnya",
    "Show More": "Tampilkan Lebih Banyak",
    "Show Less": "Tampilkan Lebih Sedikit",

    // Education & Work
    Education: "Pendidikan",
    University: "Universitas",
    Student: "Mahasiswa",
    Internship: "Magang",
    Freelancer: "Pekerja Lepas",
    Remote: "Jarak Jauh",
    "Full-time": "Penuh Waktu",
    "Part-time": "Paruh Waktu",
    Contract: "Kontrak",
    Certification: "Sertifikasi",
    Certificate: "Sertifikat",
    Course: "Kursus",
    Training: "Pelatihan",

    // Project related
    "Personal Project": "Proyek Pribadi",
    "Team Project": "Proyek Tim",
    "Open Source": "Sumber Terbuka",
    Website: "Situs Web",
    Application: "Aplikasi",
    System: "Sistem",
    Platform: "Platform",
    Tool: "Alat",
    Framework: "Framework",
    Library: "Pustaka",

    // Content Creation
    "Content Creator": "Kreator Konten",
    YouTube: "YouTube",
    TikTok: "TikTok",
    Subscribers: "Pelanggan",
    Followers: "Pengikut",
    Views: "Tayangan",
    Video: "Video",
    Tutorial: "Tutorial",
    Content: "Konten",

    // Business
    Entrepreneur: "Pengusaha",
    Business: "Bisnis",
    Company: "Perusahaan",
    Startup: "Startup",
    Founder: "Pendiri",
    CEO: "CEO",
    Manager: "Manajer",
    "Team Lead": "Pemimpin Tim",
    Coordinator: "Koordinator",

    // Time & Dates
    January: "Januari",
    February: "Februari",
    March: "Maret",
    April: "April",
    May: "Mei",
    June: "Juni",
    July: "Juli",
    August: "Agustus",
    September: "September",
    October: "Oktober",
    November: "November",
    December: "Desember",
    Present: "Sekarang",
    Current: "Saat Ini",
    Year: "Tahun",
    Month: "Bulan",
    Week: "Minggu",
    Day: "Hari",

    // Common adjectives
    Amazing: "Luar Biasa",
    Great: "Hebat",
    Awesome: "Keren",
    Excellent: "Sangat Baik",
    Good: "Baik",
    Best: "Terbaik",
    Professional: "Profesional",
    Creative: "Kreatif",
    Innovative: "Inovatif",
    Modern: "Modern",
    Responsive: "Responsif",
    Interactive: "Interaktif",
    Dynamic: "Dinamis",
    Advanced: "Lanjutan",
    Beginner: "Pemula",
    Intermediate: "Menengah",
    Expert: "Ahli",

    // Common verbs
    Develop: "Mengembangkan",
    Create: "Membuat",
    Build: "Membangun",
    Design: "Mendesain",
    Code: "Mengkode",
    Program: "Memprogram",
    Implement: "Mengimplementasikan",
    Maintain: "Memelihara",
    Deploy: "Menyebarkan",
    Test: "Menguji",
    Debug: "Debug",
    Optimize: "Mengoptimalkan",
    Manage: "Mengelola",
    Lead: "Memimpin",
    Collaborate: "Berkolaborasi",
    Work: "Bekerja",
    Study: "Belajar",
    Learn: "Mempelajari",
    Teach: "Mengajar",
    Share: "Berbagi",
    Help: "Membantu",
  };

  let translatedText = text;

  // Replace exact matches first
  Object.entries(translations).forEach(([english, indonesian]) => {
    const regex = new RegExp(`\\b${english}\\b`, "gi");
    translatedText = translatedText.replace(regex, indonesian);
  });

  return translatedText;
};

// Translation cache to avoid repeated API calls
const translationCache = new Map();

export const TranslationProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState(new Map());
  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "id", name: "Bahasa Indonesia", flag: "🇮" },
  ];

  // Function to get cached translation or fetch new one
  const getTranslation = async (text, targetLang) => {
    if (targetLang === "en") return text;

    const cacheKey = `${text}_${targetLang}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }

    const translated = await translateText(text, targetLang);
    translationCache.set(cacheKey, translated);
    return translated;
  };

  // Translate entire page content
  const translatePage = async (targetLang) => {
    if (targetLang === currentLanguage) return;

    setIsTranslating(true);
    setCurrentLanguage(targetLang);

    if (targetLang === "en") {
      // Reload to restore original content
      window.location.reload();
      return;
    }

    try {
      // Select elements to translate
      const selectors = [
        "h1, h2, h3, h4, h5, h6",
        "p:not(.no-translate)",
        "span:not(.no-translate)",
        "a:not(.no-translate)",
        "button:not(.no-translate)",
        "label:not(.no-translate)",
        "li:not(.no-translate)",
        "[data-translate]",
      ].join(", ");
      const elements = document.querySelectorAll(selectors);
      const batchSize = 5; // Smaller batches for better performance

      for (let i = 0; i < elements.length; i += batchSize) {
        const batch = Array.from(elements).slice(i, i + batchSize);
        const promises = batch.map(async (element) => {
          // Skip if element should not be translated
          if (
            element.closest("code, pre, script, style, .no-translate") ||
            element.hasAttribute("data-no-translate") ||
            element.innerHTML.includes("<") ||
            element.textContent.trim().length < 2 ||
            /^[\d\s\-\+\(\)\.\,\/@#$%^&*]+$/.test(element.textContent.trim())
          ) {
            return;
          }

          const originalText = element.textContent.trim();
          if (originalText) {
            const translatedText = await getTranslation(
              originalText,
              targetLang
            );
            if (translatedText !== originalText) {
              element.textContent = translatedText;
            }
          }
        });

        await Promise.allSettled(promises);

        // Reduced delay between batches
        if (i + batchSize < elements.length) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }
    } catch (error) {
      console.error("Page translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Function to translate specific text (for use in components)
  const t = async (text) => {
    if (currentLanguage === "en") return text;
    return await getTranslation(text, currentLanguage);
  };

  const value = {
    currentLanguage,
    setCurrentLanguage,
    languages,
    isTranslating,
    translatePage,
    t,
    getTranslation,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};
