import { useEffect, useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';

/**
 * useAchievements - Track user actions and unlock achievements
 * Easter eggs and hidden features discovery system
 */
export const useAchievements = () => {
  const { showNotification } = useNotification();
  const [currentAchievement, setCurrentAchievement] = useState(null);

  // Achievement definitions
  const achievements = {
    firstBoot: {
      id: 'first-boot',
      title: 'Welcome Aboard!',
      description: 'Launched the WebOS for the first time',
      points: 10,
      icon: 'rocket',
      rarity: 'common',
    },
    explorer: {
      id: 'explorer',
      title: 'Explorer',
      description: 'Opened 5 different apps',
      points: 20,
      requirement: 5,
      icon: 'target',
      rarity: 'common',
    },
    powerUser: {
      id: 'power-user',
      title: 'Power User',
      description: 'Used 3 keyboard shortcuts',
      points: 30,
      requirement: 3,
      icon: 'zap',
      rarity: 'rare',
    },
    nightOwl: {
      id: 'night-owl',
      title: 'Night Owl',
      description: 'Used the portfolio past midnight',
      points: 15,
      icon: 'star',
      rarity: 'common',
    },
    speedster: {
      id: 'speedster',
      title: 'Speedster',
      description: 'Used Spotlight search (Ctrl+Space)',
      points: 25,
      icon: 'zap',
      rarity: 'rare',
    },
    multitasker: {
      id: 'multitasker',
      title: 'Multitasker',
      description: 'Had 4 windows open simultaneously',
      points: 20,
      requirement: 4,
      icon: 'award',
      rarity: 'rare',
    },
    musicLover: {
      id: 'music-lover',
      title: 'Music Lover',
      description: 'Played music in the background',
      points: 15,
      icon: 'star',
      rarity: 'common',
    },
    organized: {
      id: 'organized',
      title: 'Organized',
      description: 'Checked the calendar',
      points: 10,
      icon: 'trophy',
      rarity: 'common',
    },
    curator: {
      id: 'curator',
      title: 'Curator',
      description: 'Created your first note',
      points: 15,
      icon: 'award',
      rarity: 'common',
    },
    socialite: {
      id: 'socialite',
      title: 'Socialite',
      description: 'Opened the messenger app',
      points: 10,
      icon: 'sparkles',
      rarity: 'common',
    },
    developer: {
      id: 'developer',
      title: 'Developer Mode',
      description: 'Opened DevTools (F12)',
      points: 50,
      icon: 'crown',
      rarity: 'epic',
    },
    konamiCode: {
      id: 'konami-code',
      title: 'Konami Master',
      description: 'Entered the Konami Code',
      points: 100,
      icon: 'crown',
      rarity: 'legendary',
    },
    snakeMaster: {
      id: 'snake-master',
      title: 'Snake Master',
      description: 'Scored 50 points in Snake',
      points: 50,
      icon: 'award',
      rarity: 'epic',
    },
    snakeGod: {
      id: 'snake-god',
      title: 'Snake God',
      description: 'Scored 100 points in Snake',
      points: 100,
      icon: 'crown',
      rarity: 'legendary',
    },
  };

  // Get unlocked achievements from localStorage
  const getUnlockedAchievements = () => {
    const saved = localStorage.getItem('webos-achievements');
    return saved ? JSON.parse(saved) : [];
  };

  // Save unlocked achievement
  const unlockAchievement = (achievementId) => {
    const unlocked = getUnlockedAchievements();
    
    if (unlocked.includes(achievementId)) {
      return; // Already unlocked
    }

    const achievement = achievements[achievementId];
    if (!achievement) return;

    // Add to unlocked list
    unlocked.push(achievementId);
    localStorage.setItem('webos-achievements', JSON.stringify(unlocked));

    // Set current achievement for toast display
    setCurrentAchievement(achievement);

    // Auto-hide after 6 seconds
    setTimeout(() => {
      setCurrentAchievement(null);
    }, 6000);

    // Also show basic notification as fallback
    showNotification({
      title: `🎉 ${achievement.title}`,
      message: `${achievement.description} (+${achievement.points} XP)`,
      type: 'success',
      duration: 5000,
    });

    // Play achievement sound (if sound is enabled)
    playAchievementSound();
  };

  // Achievement sound
  const playAchievementSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 523.25; // C5
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      // Silently fail if audio context not available
    }
  };

  // Track metrics
  const trackMetric = (metricName, value = 1) => {
    const metrics = JSON.parse(localStorage.getItem('webos-metrics') || '{}');
    metrics[metricName] = (metrics[metricName] || 0) + value;
    localStorage.setItem('webos-metrics', JSON.stringify(metrics));

    // Check achievement requirements
    checkAchievements(metricName, metrics[metricName]);
  };

  // Check if achievements should be unlocked based on metrics
  const checkAchievements = (metricName, value) => {
    switch (metricName) {
      case 'appsOpened':
        if (value >= 5) unlockAchievement('explorer');
        break;
      case 'keyboardShortcuts':
        if (value >= 3) unlockAchievement('powerUser');
        break;
      case 'windowsOpen':
        if (value >= 4) unlockAchievement('multitasker');
        break;
      default:
        break;
    }
  };

  // Get total points
  const getTotalPoints = () => {
    const unlocked = getUnlockedAchievements();
    return unlocked.reduce((total, id) => {
      const achievement = Object.values(achievements).find(a => a.id === id);
      return total + (achievement?.points || 0);
    }, 0);
  };

  // Get achievement progress
  const getProgress = () => {
    const unlocked = getUnlockedAchievements();
    const total = Object.keys(achievements).length;
    return {
      unlocked: unlocked.length,
      total,
      percentage: Math.round((unlocked.length / total) * 100),
      points: getTotalPoints(),
    };
  };

  return {
    achievements,
    unlockAchievement,
    getUnlockedAchievements,
    trackMetric,
    getTotalPoints,
    getProgress,
    currentAchievement,
    clearAchievement: () => setCurrentAchievement(null),
  };
};

export default useAchievements;
