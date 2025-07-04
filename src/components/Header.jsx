// src/components/Header.jsx
import React, { useContext, useState, useEffect, useRef } from "react";
import { Moon, Sun, Menu, X, Languages } from "lucide-react";
import { iconMap } from "../icons/iconMap";
import { AppContext } from "../AppContext";
import { useTranslation } from "../contexts/TranslationContext";
import { getUserProfile } from "../data/userProfile";

// Extend iconMap with newly needed icons
Object.assign(iconMap, {
  Moon: Moon,
  Sun: Sun,
  Menu: Menu,
  X: X,
  Languages: Languages,
});

const Header = () => {
  const { theme, setTheme, showCVModal, setShowCVModal } =
    useContext(AppContext);
  const {
    currentLanguage,
    languages,
    isTranslating,
    translatePage,
    translateText,
  } = useTranslation();
  const userProfile = getUserProfile(currentLanguage);

  const navLinks = [
    { href: "#about", label: translateText("About", currentLanguage) },
    {
      href: "#experience",
      label: translateText("Experience", currentLanguage),
    },
    { href: "#projects", label: translateText("Projects", currentLanguage) },
    { href: "#skills", label: translateText("Skills", currentLanguage) },
    { href: "#contact", label: translateText("Contact", currentLanguage) },
  ];

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const handleLanguageChange = async (langCode) => {
    setShowLanguageMenu(false);
    await translatePage(langCode);
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleCVClick = () => {
    setShowCVModal(true);
  };
  const handleMobileMenuToggle = () => {
    setMobileOpen(!mobileOpen);
    setShowLanguageMenu(false); // close language menu when opening mobile menu
  };
  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileOpen(false); // close mobile menu on nav click
    setShowLanguageMenu(false); // also close language menu
  }; // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      setShowLanguageMenu(false); // close language menu when mobile menu opens
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);
  // Close language menu when clicking outside or when mobile menu is open
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLanguageMenu && !event.target.closest(".language-selector")) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showLanguageMenu]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-100/80 dark:bg-[#0f172a]/80 backdrop-blur-sm shadow-md dark:shadow-cyan-500/10">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a
          href="#"
          onClick={(e) => handleNavClick(e, "#hero")}
          className="text-xl font-bold text-slate-800 dark:text-white tracking-wider"
        >
          David G.S.
        </a>
        {/* Desktop nav */}
        <div className="hidden lg:flex items-center space-x-6 text-sm text-slate-600 dark:text-gray-300">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
        {/* Right side controls */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Language Selector */}
          <div className="relative language-selector">
            <button
              onClick={() =>
                !isTranslating && setShowLanguageMenu(!showLanguageMenu)
              }
              disabled={isTranslating}
              className="relative p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 focus:outline-none"
              title={translateText("Change Language", currentLanguage)}
            >
              <div className={isTranslating ? "spinner-animate" : ""}>
                {React.createElement(iconMap.Languages, {
                  size: 18,
                  className: isTranslating ? "opacity-70" : "",
                })}
              </div>
            </button>
            {/* Language Dropdown */}
            {showLanguageMenu && !isTranslating && (
              <div className="absolute top-full right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-[60]">
                <div className="p-2">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                    {translateText("Select Language", currentLanguage)}
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      disabled={isTranslating}
                      className={`w-full px-3 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors rounded-md m-1 disabled:opacity-50 ${
                        currentLanguage === lang.code
                          ? "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg w-6 flex justify-center">
                          {lang.flag}
                        </span>
                        <span className="font-medium text-sm">{lang.name}</span>
                        {currentLanguage === lang.code && (
                          <span className="ml-auto text-cyan-500 text-sm">
                            ✓
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            {theme === "dark"
              ? React.createElement(iconMap.Sun, { size: 18 })
              : React.createElement(iconMap.Moon, { size: 18 })}
          </button>

          {/* Download CV Button */}
          <button
            onClick={handleCVClick}
            className="p-2 rounded-full bg-cyan-500 text-white hover:bg-cyan-600 shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 active:scale-95 inline-flex items-center justify-center no-translate"
            title={translateText("Preview CV", currentLanguage)}
            style={{ lineHeight: 0 }}
            data-no-translate
          >
            <span
              className="font-bold text-xs tracking-widest no-translate"
              data-no-translate
            >
              CV
            </span>
          </button>

          {/* Hire Me Button (Desktop only) */}
          <a
            href={`mailto:${userProfile.contact.email}?subject=Job%20Opportunity%20for%20David%20Garcia%20Saragih&body=Hi%20David%2C%0D%0A%0D%0AI\'d%20like%20to%20discuss%20a%20potential%20opportunity%20with%20you.%0D%0A%0D%0ABest%20regards%2C%0D%0A`}
            className="hidden lg:block bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-transform duration-300 hover:scale-105 text-sm"
          >
            {translateText("Hire Me", currentLanguage)}
          </a>

          {/* Hamburger (Mobile only) */}
          <button
            className="lg:hidden p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none"
            onClick={handleMobileMenuToggle}
          >
            {mobileOpen
              ? React.createElement(iconMap.X, { size: 20 })
              : React.createElement(iconMap.Menu, { size: 20 })}
          </button>
        </div>
      </nav>
      {/* Mobile full-screen nav overlay */}
      <div
        className={`fixed inset-0 z-[999] bg-slate-900/95 dark:bg-[#0f172a]/98 flex min-h-screen w-screen lg:hidden transition-transform duration-500 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        } ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        style={{ transitionProperty: "transform, background-color" }}
      >
        {" "}
        <button
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          {React.createElement(iconMap.X, { size: 32 })}
        </button>{" "}
        <nav className="flex flex-1 flex-col items-center justify-center w-full h-full gap-8 text-3xl font-bold text-white">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="hover:text-cyan-400 transition-colors duration-200 w-full text-center py-2"
            >
              {link.label}
            </a>
          ))}
          {/* Language Selection in Mobile - REMOVED FROM HERE */}
          {/* <div className="mt-6 w-full px-8">
            <p className="text-lg font-semibold mb-4 text-center text-cyan-400">
              Pilih Bahasa
            </p>
            <div className="flex gap-4 justify-center">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    translatePage(lang.code);
                    setMobileOpen(false);
                  }}
                  disabled={isTranslating}
                  className={`p-4 rounded-lg text-center transition-colors disabled:opacity-50 min-w-[120px] ${
                    currentLanguage === lang.code
                      ? "bg-cyan-500 text-white"
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  }`}
                >
                  <div className="text-3xl mb-2">{lang.flag}</div>
                  <div className="text-sm font-medium">{lang.name}</div>
                </button>
              ))}
            </div>
          </div> */}

          <a
            href={`mailto:${userProfile.contact.email}?subject=Job%20Opportunity%20for%20David%20Garcia%20Saragih&body=Hi%20David%2C%0D%0A%0D%0AI'd%20like%20to%20discuss%20a%20potential%20opportunity%20with%20you.%0D%0A%0D%0ABest%20regards%2C%0D%0A`}
            className="mt-10 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 px-12 rounded-xl transition-transform duration-300 hover:scale-105 text-2xl shadow-lg w-fit mx-auto"
          >
            {translateText("Hire Me", currentLanguage)}
          </a>
        </nav>
      </div>
      {/* CV Preview Modal - REMOVED */}
    </header>
  );
};

export default Header;
