import { useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';

/**
 * useAchievements - Track user actions and unlock achievements
 * Easter eggs and hidden features discovery system
 */
export const useAchievements = () => {
  const { showNotification } = useNotification();

  // Achievement definitions
  const achievements = {
    firstBoot: {
      id: 'first-boot',
      title: '🚀 Welcome Aboard!',
      description: 'Launched the WebOS for the first time',
      points: 10,
    },
    explorer: {
      id: 'explorer',
      title: '🔍 Explorer',
      description: 'Opened 5 different apps',
      points: 20,
      requirement: 5,
    },
    powerUser: {
      id: 'power-user',
      title: '⚡ Power User',
      description: 'Used 3 keyboard shortcuts',
      points: 30,
      requirement: 3,
    },
    nightOwl: {
      id: 'night-owl',
      title: '🦉 Night Owl',
      description: 'Used the portfolio past midnight',
      points: 15,
    },
    speedster: {
      id: 'speedster',
      title: '⚡ Speedster',
      description: 'Used Spotlight search (Ctrl+Space)',
      points: 25,
    },
    multitasker: {
      id: 'multitasker',
      title: '🎯 Multitasker',
      description: 'Had 4 windows open simultaneously',
      points: 20,
      requirement: 4,
    },
    musicLover: {
      id: 'music-lover',
      title: '🎵 Music Lover',
      description: 'Played music in the background',
      points: 15,
    },
    organized: {
      id: 'organized',
      title: '📅 Organized',
      description: 'Checked the calendar',
      points: 10,
    },
    curator: {
      id: 'curator',
      title: '📝 Curator',
      description: 'Created your first note',
      points: 15,
    },
    socialite: {
      id: 'socialite',
      title: '💬 Socialite',
      description: 'Opened the messenger app',
      points: 10,
    },
    developer: {
      id: 'developer',
      title: '👨‍💻 Developer Mode',
      description: 'Opened DevTools (F12)',
      points: 50,
    },
    konamiCode: {
      id: 'konami-code',
      title: '🎮 Konami Master',
      description: 'Entered the Konami Code',
      points: 100,
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

    // Show notification
    showNotification({
      title: `Achievement Unlocked! ${achievement.title}`,
      message: `${achievement.description} (+${achievement.points} points)`,
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
  };
};

export default useAchievements;
