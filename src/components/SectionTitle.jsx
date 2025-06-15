// src/components/SectionTitle.jsx
import React, { useContext } from "react";
import { AppContext } from "../AppContext";

const SectionTitle = ({ children }) => {
  const { theme } = useContext(AppContext);
  return (
    <h2
      className={`text-3xl md:text-4xl font-bold ${
        theme === "dark" ? "text-gray-100" : "text-slate-800"
      } mb-12 text-center relative`}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute -top-2 -left-2 w-10 h-10 bg-cyan-500/20 rounded-full z-0"></span>
    </h2>
  );
};

export default SectionTitle;
