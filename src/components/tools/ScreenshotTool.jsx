import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Download, X, Check, Clock } from 'lucide-react';
import html2canvas from 'html2canvas';

const ScreenshotTool = ({ onClose }) => {
  const [countdown, setCountdown] = useState(null);
  const [captured, setCaptured] = useState(null);
  const [capturing, setCapturing] = useState(false);

  const captureScreen = async (delay = 0) => {
    if (delay > 0) {
      setCapturing(true);
      for (let i = delay; i > 0; i--) {
        setCountdown(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setCountdown(null);
    }

    try {
      // Hide the screenshot tool temporarily
      const tool = document.getElementById('screenshot-tool');
      if (tool) tool.style.display = 'none';

      // Small delay to let UI update
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(document.body, {
        allowTaint: true,
        useCORS: true,
        logging: false,
        backgroundColor: null,
      });

      const dataUrl = canvas.toDataURL('image/png');
      setCaptured(dataUrl);

      // Show tool again
      if (tool) tool.style.display = 'block';
    } catch (error) {
      console.error('Screenshot failed:', error);
      alert('Failed to capture screenshot');
    } finally {
      setCapturing(false);
    }
  };

  const downloadScreenshot = () => {
    if (!captured) return;

    const link = document.createElement('a');
    link.download = `webos-screenshot-${Date.now()}.png`;
    link.href = captured;
    link.click();
  };

  const retakeScreenshot = () => {
    setCaptured(null);
  };

  return (
    <motion.div
      id="screenshot-tool"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[2147483648] flex items-center justify-center bg-black/50 backdrop-blur-sm pb-16"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl w-full max-w-2xl mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Camera className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Screenshot Tool</h2>
              <p className="text-xs text-zinc-400">Capture your WebOS desktop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {countdown !== null ? (
              <motion.div
                key="countdown"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-8xl font-bold text-blue-400 mb-4"
                >
                  {countdown}
                </motion.div>
                <p className="text-zinc-400">Get ready...</p>
              </motion.div>
            ) : captured ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="relative rounded-lg overflow-hidden border border-zinc-700">
                  <img
                    src={captured}
                    alt="Screenshot"
                    className="w-full h-auto"
                  />
                  <div className="absolute top-2 right-2 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Captured
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={downloadScreenshot}
                    className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PNG
                  </button>
                  <button
                    onClick={retakeScreenshot}
                    className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Retake
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="options"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <p className="text-sm text-zinc-400 mb-6">
                  Choose how you want to capture your screen:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => captureScreen(0)}
                    disabled={capturing}
                    className="p-4 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors group"
                  >
                    <Camera className="w-8 h-8 text-blue-400 mb-2 mx-auto group-hover:scale-110 transition-transform" />
                    <div className="font-medium text-sm">Instant</div>
                    <div className="text-xs text-zinc-400 mt-1">Capture now</div>
                  </button>

                  <button
                    onClick={() => captureScreen(3)}
                    disabled={capturing}
                    className="p-4 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors group"
                  >
                    <Clock className="w-8 h-8 text-blue-400 mb-2 mx-auto group-hover:scale-110 transition-transform" />
                    <div className="font-medium text-sm">3 Seconds</div>
                    <div className="text-xs text-zinc-400 mt-1">Short delay</div>
                  </button>

                  <button
                    onClick={() => captureScreen(5)}
                    disabled={capturing}
                    className="p-4 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors group"
                  >
                    <Clock className="w-8 h-8 text-blue-400 mb-2 mx-auto group-hover:scale-110 transition-transform" />
                    <div className="font-medium text-sm">5 Seconds</div>
                    <div className="text-xs text-zinc-400 mt-1">More time</div>
                  </button>
                </div>

                <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-xs text-blue-300">
                    💡 Tip: Use delay to position windows or switch apps before capturing
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ScreenshotTool;
