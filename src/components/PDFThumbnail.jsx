import React from 'react';
import { FileText } from 'lucide-react';

const PDFThumbnail = () => {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 20px),
                           repeating-linear-gradient(90deg, #000 0px, #000 1px, transparent 1px, transparent 20px)`
        }}></div>
      </div>
      
      {/* PDF Icon and Label */}
      <div className="relative z-10 text-center">
        <div className="mb-3 flex justify-center">
          <div className="bg-red-500/10 dark:bg-red-500/20 p-4 rounded-2xl">
            <FileText className="w-12 h-12 text-red-600 dark:text-red-400" strokeWidth={1.5} />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">UMN Festival 2025</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">UNIFY Ticketing System</p>
        </div>
      </div>
      
      {/* PDF Badge */}
      <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded shadow-lg">
        PDF
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
    </div>
  );
};

export default PDFThumbnail;
