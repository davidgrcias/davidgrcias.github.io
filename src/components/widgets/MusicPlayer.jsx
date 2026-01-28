import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, Repeat, Shuffle, X } from 'lucide-react';

/**
 * MusicPlayer - Floating music player widget
 * Features: Play/pause, skip tracks, volume control, playlist
 */
const MusicPlayer = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Demo playlist (can be replaced with real audio)
  const playlist = [
    { id: 1, title: 'Lofi Beats', artist: 'Chill Study', duration: 180, cover: '🎵' },
    { id: 2, title: 'Coding Jazz', artist: 'Dev Tunes', duration: 240, cover: '🎷' },
    { id: 3, title: 'Focus Flow', artist: 'Productivity Mix', duration: 200, cover: '🎹' },
    { id: 4, title: 'Deep Work', artist: 'Concentration', duration: 220, cover: '🎸' },
  ];

  const track = playlist[currentTrack];

  // Simulate progress
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Track ended
          if (isRepeat) {
            return 0;
          } else {
            handleNext();
            return 0;
          }
        }
        return prev + (100 / track.duration);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, isRepeat]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (isShuffle) {
      const random = Math.floor(Math.random() * playlist.length);
      setCurrentTrack(random);
    } else {
      setCurrentTrack((prev) => (prev + 1) % playlist.length);
    }
    setProgress(0);
  };

  const handlePrevious = () => {
    if (progress > 5) {
      setProgress(0);
    } else {
      setCurrentTrack((prev) => (prev - 1 + playlist.length) % playlist.length);
      setProgress(0);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = formatTime((progress / 100) * track.duration);
  const totalTime = formatTime(track.duration);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 right-6 z-[9997] pointer-events-auto"
      >
        <motion.div
          animate={{ 
            width: isExpanded ? 360 : 320,
            height: isExpanded ? 480 : 'auto'
          }}
          className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Music className="text-purple-300" size={20} />
              <span className="text-white font-semibold">Music Player</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-purple-200"
              >
                <Music size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-purple-200"
              >
                <X size={16} />
              </motion.button>
            </div>
          </div>

          {/* Album Art */}
          <div className="p-6">
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 10, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
              className="w-full aspect-square bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-8xl shadow-lg"
            >
              {track.cover}
            </motion.div>
          </div>

          {/* Track Info */}
          <div className="px-6 pb-4 text-center">
            <h3 className="text-white font-bold text-lg truncate">{track.title}</h3>
            <p className="text-purple-200 text-sm truncate">{track.artist}</p>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pb-4">
            <div className="relative h-2 bg-white/20 rounded-full overflow-hidden mb-2">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-400 to-pink-400"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-purple-200">
              <span>{currentTime}</span>
              <span>{totalTime}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-center gap-4 mb-4">
              {/* Shuffle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-2 rounded-lg transition-colors ${
                  isShuffle ? 'bg-white/20 text-white' : 'text-purple-200 hover:bg-white/10'
                }`}
              >
                <Shuffle size={18} />
              </motion.button>

              {/* Previous */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrevious}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <SkipBack size={20} />
              </motion.button>

              {/* Play/Pause */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePlayPause}
                className="p-4 bg-white rounded-full text-purple-900 shadow-lg hover:shadow-xl transition-all"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
              </motion.button>

              {/* Next */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNext}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <SkipForward size={20} />
              </motion.button>

              {/* Repeat */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-2 rounded-lg transition-colors ${
                  isRepeat ? 'bg-white/20 text-white' : 'text-purple-200 hover:bg-white/10'
                }`}
              >
                <Repeat size={18} />
              </motion.button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleMute}
                className="text-purple-200 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </motion.button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="flex-1 h-2 bg-white/20 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-white
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="text-xs text-purple-200 w-8 text-right">{isMuted ? 0 : volume}</span>
            </div>
          </div>

          {/* Playlist (when expanded) */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/10 max-h-48 overflow-y-auto"
            >
              {playlist.map((item, index) => (
                <motion.div
                  key={item.id}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  onClick={() => {
                    setCurrentTrack(index);
                    setProgress(0);
                    setIsPlaying(true);
                  }}
                  className={`
                    flex items-center gap-3 px-6 py-3 cursor-pointer transition-colors
                    ${currentTrack === index ? 'bg-white/10' : ''}
                  `}
                >
                  <span className="text-2xl">{item.cover}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.title}</p>
                    <p className="text-purple-200 text-xs truncate">{item.artist}</p>
                  </div>
                  <span className="text-xs text-purple-200">{formatTime(item.duration)}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MusicPlayer;
