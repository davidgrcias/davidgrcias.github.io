// This code is designed for React 19+ and Tailwind CSS v4+
import React, { useState, useEffect } from "react";
import CustomCursor from "./components/CustomCursor";
import SplashScreen from "./components/SplashScreen";
import PortfolioContent from "./components/PortfolioContent";
import ShootingStars from "./components/ShootingStars";
import ChatBot from "./components/ChatBot";
import { AppContext } from "./AppContext";
import {
  TranslationProvider,
  useTranslation,
} from "./contexts/TranslationContext";
import { X } from "lucide-react";

const CVModal = ({ showCVModal, setShowCVModal }) => {
  const { currentLanguage } = useTranslation();

  useEffect(() => {
    if (showCVModal) {
      document.body.classList.add("cv-modal-open");
      document.body.style.cursor = "auto";
    } else {
      document.body.classList.remove("cv-modal-open");
      document.body.style.cursor = "none";
    }

    return () => {
      document.body.classList.remove("cv-modal-open");
    };
  }, [showCVModal]);

  if (!showCVModal) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center cv-modal-container"
      onClick={() => setShowCVModal(false)}
      style={{ cursor: "auto" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-slate-900 shadow-2xl flex flex-col w-full h-full xl:w-[95vw] xl:max-w-[1000px] xl:h-[90vh] xl:m-4 xl:rounded-2xl"
        style={{ boxShadow: "0 8px 32px 0 rgba(0,0,0,0.25)", cursor: "auto" }}
      >
        <button
          onClick={() => setShowCVModal(false)}
          className="absolute right-4 top-4 z-[2] p-3 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none hover:scale-105 transition-all"
          title={currentLanguage === "id" ? "Tutup" : "Close"}
          style={{ cursor: "pointer !important" }}
        >
          <X size={22} />
        </button>
        <div
          className="overflow-y-auto flex-1 p-4 xl:p-6"
          style={{ cursor: "auto" }}
        >
          <iframe
            src="/CV_DavidGarciaSaragih.pdf"
            className="w-full h-full border-0 rounded-lg"
            title="CV Preview"
            style={{ minHeight: "600px" }}
          />
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [showCVModal, setShowCVModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.cursor = "none";
    // Exception for modal when CV is open
    const handleCVModal = () => {
      if (document.querySelector(".cv-modal-open")) {
        document.body.style.cursor = "auto";
      } else {
        document.body.style.cursor = "none";
      }
    };

    // Listen for changes in CV modal state
    const observer = new MutationObserver(handleCVModal);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.body.style.cursor = "default";
      observer.disconnect();
    };
  }, []);

  const contextValue = {
    theme,
    setTheme,
    showCVModal,
    setShowCVModal,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {isLoading ? (
        <SplashScreen onLoadingComplete={() => setIsLoading(false)} />
      ) : (
        <>
          <ShootingStars />
          <CustomCursor />
          <PortfolioContent />
          <ChatBot />
          <CVModal showCVModal={showCVModal} setShowCVModal={setShowCVModal} />
        </>
      )}
    </AppContext.Provider>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  return (
    <TranslationProvider>
      <AppContent />
    </TranslationProvider>
  );
}
