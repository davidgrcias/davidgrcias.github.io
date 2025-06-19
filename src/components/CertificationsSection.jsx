// src/components/CertificationsSection.jsx
import React from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { getCertifications } from "../data/certifications";
import { useTranslation } from "../contexts/TranslationContext";

const CertificationsSection = () => {
  const { currentLanguage } = useTranslation();
  const certifications = getCertifications(currentLanguage);

  return (
    <div className="space-y-4">
      {certifications.map((cert, index) => {
        const IconComponent = LucideIcons[cert.icon] || LucideIcons.Award;
        return (
          <motion.div
            key={index}
            role="button"
            className="bg-slate-200/50 dark:bg-slate-800/50 p-4 rounded-lg flex items-center border border-transparent hover:border-cyan-500/30 transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
            viewport={{ once: true }}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <IconComponent
              className="text-cyan-500 dark:text-cyan-400 mr-4 flex-shrink-0"
              size={24}
            />
            <div>
              <p className="font-bold text-slate-800 dark:text-white">
                {cert.name}
              </p>
              <p className="text-sm text-slate-600 dark:text-gray-400">
                {cert.provider} • {cert.date}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CertificationsSection;
