// src/data/insights.js
import { translateObject } from "../contexts/TranslationContext";

const insightsData = [
  {
    title: "Motivation",
    text: "Fueled by ambition, not afraid to fail, because every setback is simply a setup for the next level.",
    icon: "Rocket",
  },
  {
    title: "Never Going Back",
    text: "I'll never return to being the shy and reserved person I once was. Now, I confidently embrace opportunities to speak and connect.",
    icon: "SkipBack",
  },
  {
    title: "What Keeps Me Curious",
    text: "I'm endlessly curious about how things work, whether complex systems or compelling stories. I'm driven by the 'why' and 'how' behind it all.",
    icon: "SearchCheck",
  },
  {
    title: "How I Stay Updated",
    text: "I actively stay informed and up-to-date on current events, tech trends, and global developments, constantly expanding my perspective and knowledge base.",
    icon: "Newspaper",
  },
];

// Function to get translated insights based on current language
export const getInsights = (language = "en") => {
  return translateObject(insightsData, language);
};

// Default export for backward compatibility
export default insightsData;
