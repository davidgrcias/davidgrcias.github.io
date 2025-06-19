import React, { createContext, useContext, useState, useEffect } from "react";

const TranslationContext = createContext();

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
};

// COMPREHENSIVE TRANSLATION DICTIONARY - COVERS ALL PORTFOLIO CONTENT
const translations = {
  // Navigation & General - NATURAL BAHASA
  About: "Tentang Saya",
  Experience: "Pengalaman",
  Projects: "Proyek",
  Skills: "Keahlian",
  Contact: "Hubungi",
  Home: "Beranda",
  Portfolio: "Portofolio",
  "Hire Me": "Rekrut Saya",
  "Download CV": "Unduh CV",
  "Preview CV": "Lihat CV",
  "Download PDF": "Unduh PDF",
  Close: "Tutup",
  "Change Language": "Ganti Bahasa",
  "Select Language": "Pilih Bahasa",

  // HERO SECTION & ABOUT - COMPLETE NATURAL PHRASES
  "I'm": "Saya",
  "Hi, I'm": "Halo, Saya",
  "Hello, I'm": "Halo, Saya",
  "I am": "Saya adalah",
  "passionate about": "bersemangat dalam",
  "creating digital solutions": "menciptakan solusi digital",
  "that make a difference": "yang berdampak nyata",
  "Let's work together": "Mari berkolaborasi",
  "Get in touch": "Hubungi saya",
  "Feel free to": "Jangan ragu untuk",
  "reach out": "menghubungi saya",
  "I'd love to": "Saya ingin sekali",
  collaborate: "berkolaborasi",
  "work with you": "bekerja dengan Anda",

  // SPECIFIC USER PROFILE CONTENT - EXACT TRANSLATIONS
  "Programmer & Content Creator": "Programmer & Content Creator",
  "I'm driven by curiosity and the excitement of learning something new, especially when it comes to technology. What started as a hobby has grown into a habit of building, exploring, and bringing ideas to life through code and creativity":
    "Saya didorong oleh rasa penasaran dan kegembiraan mempelajari hal baru, terutama dalam teknologi. Yang dimulai sebagai hobi telah berkembang menjadi kebiasaan membangun, mengeksplorasi, dan mewujudkan ide melalui kode dan kreativitas",

  // WORK EXPERIENCE ROLES - EXACT MATCHES
  "Coordinator of Web Development": "Koordinator Pengembangan Web",
  "Founder, Digital Strategist & Web Developer":
    "Founder, Digital Strategist & Web Developer",
  "Frontend Developer": "Frontend Developer",
  "Backend Developer": "Backend Developer",
  "Web Developer": "Web Developer",

  // COMPANY & ORGANIZATION NAMES
  "UMN Festival 2025": "UMN Festival 2025",
  "Rental Mobil City Park": "Rental Mobil City Park",
  "UMN Visual Journalism Day 2024": "UMN Visual Journalism Day 2024",
  "PPIF UMN 2024": "PPIF UMN 2024",
  "UMN Tech Festival 2024": "UMN Tech Festival 2024",
  "DAAI TV": "DAAI TV",

  // WORK TYPES
  "Event Committee": "Panitia Event",
  Entrepreneurship: "Kewirausahaan",
  Internship: "Magang",

  // FUN FACTS - EXACT TRANSLATIONS
  "Hidden Talent": "Bakat Tersembunyi",
  "Surprising Fact": "Fakta Mengejutkan",
  "Most Productive Hours": "Jam Paling Produktif",
  "Best Way to Relax": "Cara Terbaik Bersantai",
  "Friends Describe Me As": "Teman Menggambarkan Saya Sebagai",
  "Underrated Joy": "Kegembiraan yang Diremehkan",

  "Ask me about Jakarta's transport routes, I can tell you the best way to reach any destination using public transport!":
    "Tanya saja tentang rute transportasi Jakarta, saya bisa memberitahu cara terbaik mencapai tujuan mana pun menggunakan transportasi umum!",
  "Though I might seem reserved at first, I genuinely love meeting and chatting with new people.":
    "Meskipun mungkin terlihat pendiam pada awalnya, saya benar-benar suka bertemu dan ngobrol dengan orang baru.",
  "Late night hours are when my creativity and productivity peak.":
    "Jam malam adalah saat kreativitas dan produktivitas saya mencapai puncak.",
  "Nothing beats unwinding after a productive day of solving complex coding challenges.":
    "Tidak ada yang mengalahkan bersantai setelah hari produktif memecahkan tantangan coding yang kompleks.",
  "Ambitious and analytical, I love digging deeper into things and always strive to improve.":
    "Ambisius dan analitis, saya suka menggali hal-hal lebih dalam dan selalu berusaha untuk berkembang.",
  "That satisfying moment when I successfully help someone solve a problem or reach their goal.":
    "Momen memuaskan itu ketika saya berhasil membantu seseorang memecahkan masalah atau mencapai tujuan mereka.",

  // TECHNICAL SKILLS - KEEP ENGLISH TERMS THAT ARE COMMONLY USED
  "Frontend Developer": "Frontend Developer",
  "Backend Developer": "Backend Developer",
  "Full Stack Developer": "Developer Full Stack",
  "Web Developer": "Developer Web",
  "Software Engineer": "Software Engineer",
  "Software Developer": "Developer Software",
  Programming: "Pemrograman",
  Development: "Pengembangan",
  Technology: "Teknologi",
  // COMMON WORDS & PHRASES
  Hello: "Halo",
  Welcome: "Selamat Datang",
  "Thank you": "Terima kasih",
  "Contact me": "Hubungi saya",
  "View Project": "Lihat Proyek",
  "Learn More": "Selengkapnya",
  "Get in Touch": "Hubungi Saya",
  "Let's Connect": "Mari Terhubung",
  "Send Message": "Kirim Pesan",
  "About Me": "Tentang Saya",
  "My Content Creation Journey": "Perjalanan Content Creation Saya",
  "Engaging with audiences through tech education and sharing knowledge across multiple platforms":
    "Berinteraksi dengan audiens melalui edukasi teknologi dan berbagi pengetahuan di berbagai platform",
  Education: "Pendidikan",
  Experience: "Pengalaman",
  "Get In Touch": "Hubungi Saya",

  // TIME & DATES
  present: "sekarang",
  Present: "Sekarang",
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

  // INSIGHTS/PHILOSOPHY - EXACT TRANSLATIONS
  "My Philosophy": "Filosofi Saya",
  "Personal Fun Facts": "Fakta Menarik Pribadi",
  Motivation: "Motivasi",
  "Never Going Back": "Tidak Akan Kembali",
  "What Keeps Me Curious": "Yang Membuat Saya Penasaran",
  "How I Stay Updated": "Cara Saya Tetap Update",
  "Fueled by ambition, not afraid to fail, because every setback is simply a setup for the next level.":
    "Didorong oleh ambisi, tidak takut gagal, karena setiap kemunduran hanyalah persiapan untuk level berikutnya.",
  "I'll never return to being the shy and reserved person I once was. Now, I confidently embrace opportunities to speak and connect.":
    "Saya tidak akan pernah kembali menjadi pribadi yang pemalu dan pendiam seperti dulu. Sekarang, saya dengan percaya diri merangkul kesempatan untuk berbicara dan terhubung.",
  "I'm endlessly curious about how things work, whether complex systems or compelling stories. I'm driven by the 'why' and 'how' behind it all.":
    "Saya tak henti-hentinya penasaran tentang bagaimana sesuatu bekerja, baik sistem yang kompleks maupun cerita yang menarik. Saya didorong oleh 'mengapa' dan 'bagaimana' di balik semuanya.",
  "I actively stay informed and up-to-date on current events, tech trends, and global developments, constantly expanding my perspective and knowledge base.":
    "Saya aktif tetap terinformasi dan update tentang peristiwa terkini, tren teknologi, dan perkembangan global, terus memperluas perspektif dan basis pengetahuan saya.",

  // EDUCATION SECTION
  "Academic journey and formal education that shaped my technical foundation and professional growth":
    "Perjalanan akademis dan pendidikan formal yang membentuk fondasi teknis dan pertumbuhan profesional saya",
  "Undergraduate Student, Informatics": "Mahasiswa Sarjana, Informatika",
  "Software Engineering": "Rekayasa Perangkat Lunak",
  "Universitas Multimedia Nusantara": "Universitas Multimedia Nusantara",
  "SMK Cinta Kasih Tzu Chi": "SMK Cinta Kasih Tzu Chi",

  // EXPERIENCE SECTION - MORE TRANSLATIONS
  "Professional milestones and hands-on experience across diverse tech projects and leadership roles":
    "Pencapaian profesional dan pengalaman langsung di berbagai proyek teknologi dan peran kepemimpinan",
  "Newest First": "Terbaru Dahulu",
  "Oldest First": "Terlama Dahulu",
  "Show More Experiences": "Tampilkan Lebih Banyak Pengalaman",
  "Show Less Experiences": "Tampilkan Lebih Sedikit",

  // SKILLS SECTION
  "Core Competencies": "Kompetensi Inti",
  "Technical expertise and professional skills developed through practical experience and continuous learning":
    "Keahlian teknis dan keterampilan profesional yang dikembangkan melalui pengalaman praktis dan pembelajaran berkelanjutan",
  "Licenses & Certifications": "Lisensi & Sertifikasi",
  "Professional certifications and achievements validating expertise in various technical domains":
    "Sertifikasi profesional dan pencapaian yang memvalidasi keahlian di berbagai domain teknis",

  // CONTACT SECTION
  "I'm currently open to new opportunities and collaborations. Feel free to reach out if you have a project in mind or just want to connect!":
    "Saya saat ini terbuka untuk peluang dan kolaborasi baru. Jangan ragu untuk menghubungi jika Anda memiliki proyek atau hanya ingin terhubung!",
  "Say Hello on WhatsApp": "Sapa di WhatsApp",
  "Visit YouTube Channel": "Kunjungi Channel YouTube",
  "Follow on TikTok": "Ikuti di TikTok",

  // CERTIFICATION PROVIDERS
  "Huawei ICT Academy": "Huawei ICT Academy",
  Sololearn: "Sololearn",
  Progate: "Progate",
  "HIMPS-HI UPH": "HIMPS-HI UPH",

  // CERTIFICATION NAMES
  "HCIA-AI V3.5 Course": "Kursus HCIA-AI V3.5",
  "Python Intermediate Course": "Kursus Python Menengah",
  "PHP Course": "Kursus PHP",
  "React Course": "Kursus React",
  "SQL Course": "Kursus SQL",
  "Web Development Course": "Kursus Pengembangan Web",
  "GIT Course": "Kursus GIT",
  "Startup of New Innovation Challenge": "Startup of New Innovation Challenge",
  GPA: "IPK",
  // FOOTER
  "Designed & Built with": "Dirancang & Dibangun dengan",

  // PROJECTS SECTION
  Projects: "Proyek",
  "From beginner-friendly to real-world applications, explore my journey through different project tiers":
    "Dari yang ramah pemula hingga aplikasi dunia nyata, jelajahi perjalanan saya melalui berbagai tingkatan proyek",
  "All Projects": "Semua Proyek",
  Beginner: "Pemula",
  Intermediate: "Menengah",
  Advanced: "Lanjutan",
  "Real-World": "Dunia Nyata",
  Capstone: "Capstone",
  Experimental: "Eksperimental",
  "View Project": "Lihat Proyek",
  "Show More Projects": "Tampilkan Lebih Banyak Proyek",
  "Show Less Projects": "Tampilkan Lebih Sedikit Proyek",
  "Too many to list!": "Terlalu banyak untuk dicantumkan!",
  "I've worked on a wide variety of projects, more than I could fit here.":
    "Saya telah mengerjakan berbagai macam proyek, lebih dari yang bisa saya cantumkan di sini.",
  "Check out more on": "Lihat lebih banyak di",
  "to see the full journey.": "untuk melihat perjalanan lengkapnya.",
  ", or": ", atau",

  // CHATBOT TRANSLATIONS
  "👋 Hi! I'm David's assistant. How can I help you?":
    "👋 Halo! Saya asisten David. Bagaimana saya bisa membantu Anda?",
  "What's David's age and background?":
    "Berapa umur David dan latar belakangnya?",
  "Show me his technical skills": "Tunjukkan keahlian teknisnya",
  "Tell me about his YouTube journey":
    "Ceritakan tentang perjalanan YouTube-nya",
  "What projects is he working on?": "Proyek apa yang sedang dia kerjakan?",
  "How can I contact him?": "Bagaimana saya bisa menghubunginya?",

  // CHATBOT - GREETINGS & WELCOME
  "Hello!  I'm here to tell you all about David Garcia Saragih. What would you like to know?":
    "Halo!  Saya di sini untuk memberitahu Anda semua tentang David Garcia Saragih. Apa yang ingin Anda ketahui?",
  "Hey there! 😊 Ready to learn about David's amazing journey? What interests you most?":
    "Hai! 😊 Siap untuk belajar tentang perjalanan luar biasa David? Apa yang paling menarik bagi Anda?",
  "Hi!  I'm David's AI assistant. Ask me anything about his skills, experience, or projects!":
    "Hai!  Saya asisten AI David. Tanyakan apa saja tentang keahlian, pengalaman, atau proyeknya!",
  "Greetings! 🎉 I know everything about David. What aspect of his profile would you like to explore?":
    "Salam! 🎉 Saya tahu segalanya tentang David. Aspek mana dari profilnya yang ingin Anda jelajahi?",

  // CHATBOT - AFFIRMATIVE RESPONSES
  "I'm so glad you agree! 😊 David really is exceptional. What else would you like to explore about his journey?":
    "Saya senang Anda setuju! 😊 David memang luar biasa. Apa lagi yang ingin Anda jelajahi tentang perjalanannya?",
  "Absolutely! 🎉 His achievements at just 19 are truly remarkable. Any specific area you'd like to dive deeper into?":
    "Tentu saja! 🎉 Prestasinya di usia 19 tahun benar-benar luar biasa. Adakah area spesifik yang ingin Anda dalami?",
  "Exactly!  It's amazing what he's accomplished. What other aspects of his profile interest you?":
    "Tepat sekali!  Sungguh menakjubkan apa yang telah ia capai. Aspek lain apa dari profilnya yang menarik bagi Anda?",
  "Right?! 🚀 His combination of technical skills and entrepreneurship is impressive. Want to know more about any particular area?":
    "Benar kan?! 🚀 Kombinasi keahlian teknis dan kewirausahaannya sangat mengesankan. Ingin tahu lebih banyak tentang area tertentu?",
  "That's what I think too! ✨ There's so much more to discover about David. What would you like to explore next?":
    "Itu juga yang saya pikirkan! ✨ Masih banyak lagi yang bisa ditemukan tentang David. Apa yang ingin Anda jelajahi selanjutnya?",

  // CHATBOT - CLARIFICATION RESPONSES
  "I understand! 🤔 What specific aspect would you like to know more about instead?":
    "Saya mengerti! 🤔 Aspek spesifik apa yang ingin Anda ketahui sebagai gantinya?",
  "No worries at all! 😊 Is there something particular about David that interests you more?":
    "Tidak masalah sama sekali! 😊 Adakah sesuatu yang khusus tentang David yang lebih menarik bagi Anda?",
  "Fair enough! 💭 What would you like me to focus on regarding David's background?":
    "Cukup adil! 💭 Apa yang Anda ingin saya fokuskan mengenai latar belakang David?",
  "Got it! 🎯 What other information about David would be helpful for you?":
    "Mengerti! 🎯 Informasi lain apa tentang David yang akan membantu Anda?",

  // CHATBOT - APPRECIATION RESPONSES
  "You're very welcome!  I love sharing David's story. What else would you like to discover?":
    "Sama-sama!  Saya suka berbagi cerita David. Apa lagi yang ingin Anda temukan?",
  "Thank you! 🌟 It's my pleasure to help you learn about David. Any other questions?":
    "Terima kasih! 🌟 Dengan senang hati saya membantu Anda belajar tentang David. Ada pertanyaan lain?",
  "I'm so glad you found it helpful! 🎉 Feel free to ask me anything else about David's journey.":
    "Saya senang Anda merasa ini membantu! 🎉 Jangan ragu untuk menanyakan hal lain tentang perjalanan David.",
  "Awesome! 💙 David's story is truly inspiring. What other aspects would you like to explore?":
    "Luar biasa! 💙 Kisah David benar-benar menginspirasi. Aspek lain apa yang ingin Anda jelajahi?",

  // CHATBOT - CV RESPONSE
  "📄 Here's David's comprehensive CV!": "📄 Ini dia CV lengkap David!",
  "You can download his full CV (PDF format) here:":
    "Anda dapat mengunduh CV lengkapnya (format PDF) di sini:",
  "The CV includes:": "CV ini mencakup:",
  "• Complete professional experience": "• Pengalaman profesional lengkap",
  "• Technical skills and certifications": "• Keahlian teknis dan sertifikasi",
  "• Educational background": "• Latar belakang pendidikan",
  "• Notable achievements and projects": "• Prestasi dan proyek terkemuka",
  "Would you like me to tell you about any specific aspect of his background? 😊":
    "Apakah Anda ingin saya ceritakan tentang aspek spesifik dari latar belakangnya? 😊",

  // CHATBOT - SUGGESTED REPLIES
  "Tell me about his achievements": "Ceritakan tentang prestasinya",
  "What makes him unique?": "Apa yang membuatnya unik?",
  "Show me his technical expertise": "Tunjukkan keahlian teknisnya",
  "His content creation journey": "Perjalanan pembuatan kontennya",
  "What's his educational background?": "Apa latar belakang pendidikannya?",
  "Tell me about his business ventures": "Ceritakan tentang usaha bisnisnya",
  "What programming languages does he know?":
    "Bahasa pemrograman apa yang dia kuasai?",
  "Show me his social media stats": "Tunjukkan statistik media sosialnya",
  "What certifications does he have?": "Sertifikasi apa yang dia miliki?",
  "How did he achieve all this at 19?":
    "Bagaimana dia mencapai semua ini di usia 19?",
  "His technical skills breakdown": "Rincian keahlian teknisnya",
  "Educational achievements and GPA": "Prestasi pendidikan dan IPK",
  "Content creation statistics": "Statistik pembuatan konten",
  "Professional work experience": "Pengalaman kerja profesional",
  "Personal interests and hobbies": "Minat dan hobi pribadi",
  "What's his biggest achievement?": "Apa pencapaian terbesarnya?",
  "Tell me about his learning approach":
    "Ceritakan tentang pendekatan belajarnya",
  "Show me his future goals": "Tunjukkan tujuan masa depannya",
  "What inspired his career path?": "Apa yang menginspirasi jalur karirnya?",
  "What are his biggest achievements?": "Apa saja pencapaian terbesarnya?",
  "Tell me about his entrepreneurship": "Ceritakan tentang kewirausahaannya",
  "How did he start content creation?":
    "Bagaimana dia memulai pembuatan konten?",
  "What's he currently learning?": "Apa yang sedang dia pelajari saat ini?",
  "Show me his work experience": "Tunjukkan pengalaman kerjanya",
  "Tell me about his certifications": "Ceritakan tentang sertifikasinya",
  "What tools does he master?": "Alat apa yang dia kuasai?",
  "How proficient is he in React?": "Seberapa mahir dia dalam React?",
  "What's his GPA and achievements?": "Berapa IPK dan prestasinya?",
  "How does he balance everything?": "Bagaimana dia menyeimbangkan semuanya?",
  "Tell me about his current projects": "Ceritakan tentang proyeknya saat ini",
  "How can I work with him?": "Bagaimana saya bisa bekerja dengannya?",
  "What's his content creation like?": "Seperti apa pembuatan kontennya?",
  "What are his technical strengths?": "Apa kekuatan teknisnya?",
  "Show me his educational journey": "Tunjukkan perjalanan pendidikannya",
  "How many followers does he have?": "Berapa banyak pengikut yang dia miliki?",
  "Check out his YouTube channel": "Lihat saluran YouTube-nya",
  "Tell me about his business": "Ceritakan tentang bisnisnya",
  "Download his complete CV": "Unduh CV lengkapnya",
  "What are his social media stats?": "Apa statistik media sosialnya?",
  "Show me his latest projects": "Tunjukkan proyek terbarunya",
  "What are his main technical skills?": "Apa keahlian teknis utamanya?",
  "What are his educational achievements?": "Apa prestasi pendidikannya?",
  "How many YouTube subscribers?": "Berapa banyak pelanggan YouTube-nya?",
  "Tell me about his TikTok success": "Ceritakan tentang kesuksesan TikTok-nya",
  "What type of content does he create?": "Jenis konten apa yang dia buat?",
  "When did he start creating content?": "Kapan dia mulai membuat konten?",
  "What business does he run?": "Bisnis apa yang dia jalankan?",
  "Tell me about his technical roles": "Ceritakan tentang peran teknisnya",
  "What are his future business plans?": "Apa rencana bisnis masa depannya?",
  "How many total views does he have?":
    "Berapa total penayangan yang dia miliki?",
  "When did he start his channel?": "Kapan dia memulai salurannya?",
  "Show me his other social platforms":
    "Tunjukkan platform media sosial lainnya",
  "What's his role in UMN Festival?": "Apa perannya di UMN Festival?",
  "How can I collaborate with him?":
    "Bagaimana saya bisa berkolaborasi dengannya?",
};

// Pre-process translations for efficiency
const processedTranslations = Object.entries(translations)
  .filter(
    ([english, indonesian]) => english && indonesian && english !== indonesian
  )
  .map(([english, indonesian]) => ({
    indonesian,
    regex: new RegExp(
      `^${english.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      "i"
    ),
  }))
  .sort((a, b) => b.regex.source.length - a.regex.source.length); // Sort by original string length for priority

const translationCache = new Map();

// SMART TRANSLATION FUNCTION FOR ANY TEXT/OBJECT
export const translateText = (text, targetLang = "id") => {
  if (!text || targetLang === "en") return text;
  if (typeof text !== "string") return text;

  const cacheKey = `${targetLang}|${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  for (const { indonesian, regex } of processedTranslations) {
    if (regex.test(text)) {
      translationCache.set(cacheKey, indonesian);
      return indonesian;
    }
  }

  // No partial matching to avoid incorrect translations and improve performance.
  // If no exact match is found, return the original text.
  translationCache.set(cacheKey, text);
  return text;
};

// TRANSLATE ENTIRE OBJECTS RECURSIVELY
export const translateObject = (obj, targetLang = "id") => {
  if (!obj || targetLang === "en") return obj;

  if (typeof obj === "string") {
    return translateText(obj, targetLang);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => translateObject(item, targetLang));
  }

  if (typeof obj === "object" && obj !== null) {
    const translated = {};
    for (const [key, value] of Object.entries(obj)) {
      translated[key] = translateObject(value, targetLang);
    }
    return translated;
  }

  return obj;
};

export const TranslationProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
  ];

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const translatePage = async (targetLang) => {
    if (targetLang === currentLanguage) return;

    setIsTranslating(true);
    setCurrentLanguage(targetLang);
    translationCache.clear(); // Clear cache on language change

    // Simple approach - just reload to re-render with new language
    setTimeout(() => {
      setIsTranslating(false);
    }, 300);
  };

  const value = {
    currentLanguage,
    setCurrentLanguage,
    languages,
    isTranslating,
    translatePage,
    translateText,
    translateObject,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export default TranslationContext;
