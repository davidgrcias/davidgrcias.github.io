import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ExternalLink, FileText, Loader2 } from 'lucide-react';

/**
 * PDF Preview Modal - Responsive CV/PDF Viewer
 * Supports preloading for instant display
 */
const PDFViewer = ({ isOpen, onClose, pdfUrl, title = 'Document', preloadedUrl = null }) => {
    const [isLoading, setIsLoading] = useState(true);

    // Reset loading state when modal opens/closes or URL changes
    // If preloaded, skip loading state
    React.useEffect(() => {
        if (isOpen) {
            setIsLoading(!preloadedUrl);
        }
    }, [isOpen, pdfUrl, preloadedUrl]);

    if (!isOpen) return null;

    // Detect URL type and use FASTEST embed format
    const isGoogleDocsViewer = pdfUrl?.includes('docs.google.com/viewer');
    const isGoogleDrive = pdfUrl?.includes('drive.google.com');

    // Determine the embed URL - FASTEST METHOD
    let embedUrl = pdfUrl;
    let fileId = null;

    // Extract Google Drive file ID
    if (isGoogleDrive || isGoogleDocsViewer) {
        const match1 = pdfUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        const match2 = pdfUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        fileId = match1?.[1] || match2?.[1];
    }

    if (fileId) {
        // FASTEST: Direct Google Drive preview embed (no redirect, instant load)
        embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    } else if (!isGoogleDocsViewer && !isGoogleDrive) {
        // Regular PDF URL
        embedUrl = `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`;
    }

    // Use preloaded URL if available, otherwise generate embed URL
    const finalEmbedUrl = preloadedUrl || embedUrl;

    // Download CV (only if user explicitly wants to)
    const handleDownload = () => {
        if (fileId) {
            // Google Drive direct download
            window.open(`https://drive.google.com/uc?export=download&id=${fileId}`, '_blank');
            return;
        }
        // For regular URLs
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'CV.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Open preview in new tab (NOT download!)
    const handleOpenInNewTab = () => {
        window.open(finalEmbedUrl, '_blank');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[2147483648] flex items-center justify-center p-4 pb-16 bg-black/70 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-4xl h-[90vh] max-h-[900px] bg-zinc-900 rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/80 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <FileText size={20} className="text-cyan-400" />
                                <h2 className="text-white font-medium text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">
                                    {title}
                                </h2>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Open in new tab */}
                                <button
                                    onClick={handleOpenInNewTab}
                                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    title="Open in new tab"
                                >
                                    <ExternalLink size={18} />
                                </button>

                                {/* Download button */}
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium rounded-lg transition-colors"
                                    title="Download CV"
                                >
                                    <Download size={16} />
                                    <span className="hidden sm:inline">Download</span>
                                </button>

                                {/* Close button */}
                                <button
                                    onClick={onClose}
                                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    title="Close"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* PDF Embed */}
                        <div className="flex-1 bg-zinc-800 relative">
                            {/* Loading Spinner */}
                            {isLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800 z-10 transition-opacity duration-300">
                                    <Loader2 size={48} className="text-cyan-400 animate-spin mb-4" />
                                    <p className="text-white/60 text-sm">Loading document...</p>
                                </div>
                            )}

                            {/* Desktop/Tablet: Use iframe embed */}
                            <iframe
                                src={finalEmbedUrl}
                                className="w-full h-full border-0 hidden sm:block"
                                title={title}
                                onLoad={() => setIsLoading(false)}
                                allow="autoplay"
                            />

                            {/* Mobile: Show preview image/placeholder with download option */}
                            <div className="sm:hidden flex flex-col items-center justify-center h-full p-6 text-center">
                                <div className="w-24 h-32 bg-white rounded-lg shadow-lg flex items-center justify-center mb-6">
                                    <FileText size={48} className="text-red-500" />
                                </div>
                                <h3 className="text-white text-lg font-medium mb-2">{title}</h3>
                                <p className="text-white/60 text-sm mb-6">
                                    PDF preview may not be fully supported on this device.
                                </p>
                                <div className="flex flex-col gap-3 w-full max-w-xs">
                                    <button
                                        onClick={handleOpenInNewTab}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                                    >
                                        <ExternalLink size={18} />
                                        <span>View PDF</span>
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl transition-colors"
                                    >
                                        <Download size={18} />
                                        <span>Download CV</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer hint */}
                        <div className="px-4 py-2 bg-zinc-800/50 border-t border-white/5 text-center">
                            <p className="text-white/40 text-xs">
                                Press Esc or click outside to close
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PDFViewer;
