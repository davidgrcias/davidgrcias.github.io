import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const MusicPlayerContext = createContext(null);

export const MusicPlayerProvider = ({ children }) => {
  const audioRef = useRef(typeof Audio !== 'undefined' ? new Audio() : null);
  const [isPlayerOpen, setPlayerOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(180);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const playlist = useMemo(() => ([
    { id: 1, title: 'Lofi Beats', artist: 'Chill Study', duration: 180, cover: '🎵', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 2, title: 'Coding Jazz', artist: 'Dev Tunes', duration: 240, cover: '🎷', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 3, title: 'Focus Flow', artist: 'Productivity Mix', duration: 200, cover: '🎹', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: 4, title: 'Deep Work', artist: 'Concentration', duration: 220, cover: '🎸', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  ]), []);

  const playlistRef = useRef(playlist);
  const currentTrackRef = useRef(currentTrack);
  const repeatRef = useRef(isRepeat);
  const shuffleRef = useRef(isShuffle);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    repeatRef.current = isRepeat;
  }, [isRepeat]);

  useEffect(() => {
    shuffleRef.current = isShuffle;
  }, [isShuffle]);

  const getTrackByIndex = useCallback((index) => {
    const list = playlistRef.current;
    if (!list || list.length === 0) return null;
    return list[index] || list[0];
  }, []);

  const playTrackByIndex = useCallback(async (index, autoPlay = true) => {
    const audio = audioRef.current;
    const track = getTrackByIndex(index);
    if (!audio || !track) return;

    if (audio.src !== track.src) {
      audio.src = track.src;
      audio.preload = 'metadata';
      audio.load();
    }

    setCurrentTrack(index);
    setProgress(0);
    setDuration(track.duration);

    if (autoPlay) {
      try {
        await audio.play();
      } catch {
        setIsPlaying(false);
      }
    }
  }, [getTrackByIndex]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    const track = getTrackByIndex(currentTrackRef.current);
    if (!audio || !track) return;

    if (audio.src !== track.src) {
      audio.src = track.src;
      audio.preload = 'metadata';
      audio.load();
    }

    try {
      await audio.play();
    } catch {
      setIsPlaying(false);
    }
  }, [getTrackByIndex]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      play();
    } else {
      pause();
    }
  }, [pause, play]);

  const next = useCallback((autoPlay = true) => {
    const list = playlistRef.current;
    if (!list || list.length === 0) return;

    const nextIndex = shuffleRef.current
      ? Math.floor(Math.random() * list.length)
      : (currentTrackRef.current + 1) % list.length;

    playTrackByIndex(nextIndex, autoPlay);
  }, [playTrackByIndex]);

  const prev = useCallback((autoPlay = true) => {
    const audio = audioRef.current;
    const list = playlistRef.current;
    if (!audio || !list || list.length === 0) return;

    if (audio.currentTime > 5) {
      audio.currentTime = 0;
      return;
    }

    const prevIndex = (currentTrackRef.current - 1 + list.length) % list.length;
    playTrackByIndex(prevIndex, autoPlay);
  }, [playTrackByIndex]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setIsRepeat((prev) => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : duration);
    };

    const handleTimeUpdate = () => {
      const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      setProgress(pct);
    };

    const handleEnded = () => {
      if (repeatRef.current) {
        audio.currentTime = 0;
        audio.play().catch(() => setIsPlaying(false));
        return;
      }
      next(true);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    setIsPlaying(!audio.paused);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [duration, next]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  const contextValue = {
    playlist,
    track: getTrackByIndex(currentTrack) || playlist[0],
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
    play,
    pause,
    togglePlay,
    next,
    prev,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    setVolume,
    setMuted: setIsMuted,
    playTrackByIndex,
  };

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  }
  return context;
};
