// src/components/Header.jsx
import React, { useContext, useState, useEffect } from "react";
import { Sun, Moon, Menu, X } from "lucide-react";
import { AppContext } from "../AppContext";
import userProfile from "../data/userProfile";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

const Header = () => {
  const { theme, setTheme } = useContext(AppContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileOpen(false); // close mobile menu on nav click
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-100/80 dark:bg-[#0f172a]/80 backdrop-blur-sm shadow-md dark:shadow-cyan-500/10">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a
          href="#"
          onClick={(e) => handleNavClick(e, "#hero")}
          className="text-xl font-bold text-slate-800 dark:text-white tracking-wider"
        >
          David G.
        </a>
        {/* Desktop nav */}
        <div className="hidden md:flex items-center space-x-6 text-sm text-slate-600 dark:text-gray-300">
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
        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {/* Hire Me button (desktop only) */}
          <a
            href={`mailto:${userProfile.contact.email}`}
            className="hidden md:block bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-transform duration-300 hover:scale-105 text-sm"
          >
            Hire Me
          </a>
          {/* Hamburger (mobile only) */}
          <button
            className="md:hidden p-2 ml-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>
      {/* Mobile full-screen nav overlay */}
      <div
        className={`fixed inset-0 z-[999] bg-slate-900/95 dark:bg-[#0f172a]/98 flex min-h-screen w-screen md:hidden transition-transform duration-500 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        } ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        style={{ transitionProperty: "transform, background-color" }}
      >
        <button
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-slate-600"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X size={32} />
        </button>
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
          <a
            href={`mailto:${userProfile.contact.email}`}
            className="mt-10 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 px-12 rounded-xl transition-transform duration-300 hover:scale-105 text-2xl shadow-lg w-fit mx-auto"
          >
            Hire Me
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
