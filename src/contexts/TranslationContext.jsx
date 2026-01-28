import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const TranslationContext = createContext();

const TRANSLATE_ENDPOINTS = [
  "/api/translate",
  "https://libretranslate.de/translate",
  "https://translate.astian.org/translate",
];

const translationCache = new Map();
const translationInFlight = new Set();
const translationListeners = new Set();
const originalTextMap = new WeakMap();

const notifyTranslationUpdate = () => {
  translationListeners.forEach((listener) => listener());
};

const subscribeTranslationUpdates = (listener) => {
  translationListeners.add(listener);
  return () => translationListeners.delete(listener);
};

const fetchTranslation = async (text, targetLang) => {
  // 1. Try Vercel Serverless Proxy (Production)
  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: "en", target: targetLang, format: "text" }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.translatedText) return data.translatedText;
    }
  } catch (error) {
    // Silent fail, try next
  }

  // 2. Try Google Translate (GTX - Unofficial, reliable for client-side)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      // GT returns array of arrays: [[["translated", "original", ...], ...]]
      if (data && data[0]) {
        return data[0].map(item => item[0]).join('');
      }
    }
  } catch (error) {
    // Silent fail
  }

  // 3. Try MyMemory API (Free tier, reliable)
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      }
    }
  } catch (error) {
    // Silent fail
  }

  // Final Faillback: Return original text
  if (import.meta.env.DEV) {
    console.warn(`Translation APIs failed for: "${text}". Returning original.`);
  }
  return text;
};

const translateTextAsync = async (text, targetLang) => {
  const cacheKey = `${targetLang}|${text}`;
  
  // Check memory cache
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  // Fetch from API
  const translated = await fetchTranslation(text, targetLang);
  translationCache.set(cacheKey, translated);
  return translated;
};

export const translateText = (text, targetLang = "en") => {
  if (!text || targetLang === "en") return text;
  if (typeof text !== "string") return text;

  const cacheKey = `${targetLang}|${text}`;
  
  // 1. Check Memory Cache
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  // 2. Trigger Async Fetch (Background Update)
  if (!translationInFlight.has(cacheKey)) {
    translationInFlight.add(cacheKey);
    fetchTranslation(text, targetLang)
      .then((translated) => {
        translationCache.set(cacheKey, translated);
        translationInFlight.delete(cacheKey);
        notifyTranslationUpdate();
      })
      .catch(() => {
        translationCache.set(cacheKey, text); // Cache original on failure to stop retrying
        translationInFlight.delete(cacheKey);
        notifyTranslationUpdate();
      });
  }

  return text; // Return original while waiting for API
};

export const translateObject = (obj, targetLang = "en") => {
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

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
};

const resolveInitialLanguage = () => {
  try {
    const stored = localStorage.getItem("webos-settings");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.language) return parsed.language;
    }
  } catch {
    // ignore
  }
  return "en";
};

export const TranslationProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(resolveInitialLanguage);
  const [isTranslating, setIsTranslating] = useState(false);
  const [, forceUpdate] = useState(0);
  const translateTimerRef = useRef(null);

  const languages = useMemo(() => [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
  ], []);

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  useEffect(() => {
    return subscribeTranslationUpdates(() => {
      forceUpdate((prev) => prev + 1);
    });
  }, []);

  const translatePage = (targetLang) => {
    if (targetLang === currentLanguage) return;
    setIsTranslating(true);
    setCurrentLanguage(targetLang);
    translationCache.clear();

    if (translateTimerRef.current) {
      clearTimeout(translateTimerRef.current);
    }

    translateTimerRef.current = setTimeout(() => {
      setIsTranslating(false);
    }, 300);
  };

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;

    const shouldTranslate = currentLanguage !== "en";

    const isSkippable = (node) => {
      if (!node || !node.parentElement) return true;
      const tag = node.parentElement.tagName;
      if (!tag) return true;
      return ["SCRIPT", "STYLE", "CODE", "PRE", "KBD", "SVG", "PATH", "INPUT", "TEXTAREA"].includes(tag);
    };

    const processNode = async (node) => {
      if (!node || node.nodeType !== Node.TEXT_NODE) return;
      const text = node.textContent;
      if (!text || !text.trim()) return;
      if (isSkippable(node)) return;

      const original = originalTextMap.get(node) || text;
      if (!originalTextMap.has(node)) {
        originalTextMap.set(node, original);
      }

      if (!shouldTranslate) {
        node.textContent = original;
        return;
      }

      try {
        const translated = await translateTextAsync(original, currentLanguage);
        if (node.textContent === original) {
          node.textContent = translated;
        }
      } catch {
        // Keep original on failure
      }
    };

    const walk = (container) => {
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
      const nodes = [];
      let current = walker.nextNode();
      while (current) {
        nodes.push(current);
        current = walker.nextNode();
      }
      nodes.forEach((node) => {
        processNode(node);
      });
    };

    walk(root);

    const observer = new MutationObserver((mutations) => {
      if (!shouldTranslate) return;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            processNode(node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            walk(node);
          }
        });
      });
    });

    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [currentLanguage]);

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
