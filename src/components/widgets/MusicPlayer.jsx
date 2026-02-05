import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, Repeat, Shuffle, X } from 'lucide-react';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';

/**
 * MusicPlayer - Floating music player widget
 * Features: Play/pause, skip tracks, volume control, playlist
 */
const MusicPlayer = () => {
  const {
    playlist,
    track,
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    isRepeat,
    isShuffle,
    isPlayerOpen,
    setPlayerOpen,
    togglePlay,
    next,
    prev,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    setVolume,
    setMuted,
    playTrackByIndex,
  } = useMusicPlayer();

  const [isExpanded, setIsExpanded] = useState(false);

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (newVolume === 0) {
      setMuted(true);
    } else if (isMuted) {
      setMuted(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = formatTime(((progress / 100) * duration) || 0);
  const totalTime = formatTime(duration || track.duration);

  if (!isPlayerOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 right-4 z-[9997] pointer-events-auto max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          animate={{
            width: isExpanded ? 'min(360px, 90vw)' : 'min(320px, 90vw)',
            height: isExpanded ? 'min(480px, calc(100vh - 8rem))' : 'auto'
          }}
          className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden max-h-[calc(100vh-6rem)] flex flex-col"
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
                onClick={() => setPlayerOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-purple-200"
              >
                <X size={16} />
              </motion.button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Album Art */}
            <div className="p-4">
              <motion.div
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 10, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
                className="w-full max-w-[200px] mx-auto aspect-square bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-6xl shadow-lg"
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
                  onClick={toggleShuffle}
                  className={`p-2 rounded-lg transition-colors ${isShuffle ? 'bg-white/20 text-white' : 'text-purple-200 hover:bg-white/10'
                    }`}
                >
                  <Shuffle size={18} />
                </motion.button>

                {/* Previous */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => prev(true)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <SkipBack size={20} />
                </motion.button>

                {/* Play/Pause */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlay}
                  className="p-4 bg-white rounded-full text-purple-900 shadow-lg hover:shadow-xl transition-all"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
                </motion.button>

                {/* Next */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => next(true)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <SkipForward size={20} />
                </motion.button>

                {/* Repeat */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleRepeat}
                  className={`p-2 rounded-lg transition-colors ${isRepeat ? 'bg-white/20 text-white' : 'text-purple-200 hover:bg-white/10'
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
                    onClick={() => playTrackByIndex(index, true)}
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
          </div>
          {/* Audio is managed by MusicPlayerContext */}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MusicPlayer;
