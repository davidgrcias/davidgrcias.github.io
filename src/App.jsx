// This code is designed for React 19+ and Tailwind CSS v4+
import React, { useState, useEffect } from "react";
import CustomCursor from "./components/CustomCursor";
import SplashScreen from "./components/SplashScreen";
import PortfolioContent from "./components/PortfolioContent";
import ShootingStars from "./components/ShootingStars";
import ChatBot from "./components/ChatBot";
import { AppContext } from "./AppContext";
import { TranslationProvider } from "./contexts/TranslationContext";

// --- MAIN APP COMPONENT ---
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    document.body.style.cursor = "none";
    return () => {
      document.body.style.cursor = "default";
    };
  }, []);
  const contextValue = { theme, setTheme };
  return (
    <AppContext.Provider value={contextValue}>
      <TranslationProvider>
        {isLoading ? (
          <SplashScreen onLoadingComplete={() => setIsLoading(false)} />
        ) : (
          <>
            <ShootingStars />
            <CustomCursor />
            <PortfolioContent />
            <ChatBot />
          </>
        )}
      </TranslationProvider>
    </AppContext.Provider>
  );
}
