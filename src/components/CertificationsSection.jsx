// src/components/CertificationsSection.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award } from "lucide-react";
import certifications from "../data/certifications";

const CertificationsSection = () => {
  const [openCert, setOpenCert] = useState(null);
  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800 dark:text-gray-100 mb-8 text-center">
        Licenses & Certifications
      </h2>
      <div className="space-y-4">
        {certifications.map((cert, index) => (
          <div key={index}>
            <motion.div
              role="button"
              onClick={() => setOpenCert(openCert === index ? null : index)}
              className="bg-slate-200/50 dark:bg-slate-800/50 p-4 rounded-lg flex items-center border border-transparent hover:border-cyan-500/30 transition-colors cursor-pointer"
              viewport={{ once: true }}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Award
                className="text-cyan-500 dark:text-cyan-400 mr-4 flex-shrink-0"
                size={24}
              />
              <div>
                <p className="font-bold text-slate-800 dark:text-white">
                  {cert.name}
                </p>
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  {cert.provider} - {cert.date}
                </p>
              </div>
            </motion.div>
            <AnimatePresence>
              {openCert === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: "1rem" }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <img
                    src={cert.certImage}
                    alt={`${cert.name} certificate`}
                    className="rounded-lg w-full object-cover"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificationsSection;
