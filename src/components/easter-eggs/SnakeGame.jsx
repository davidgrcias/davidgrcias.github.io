import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Trophy, Gamepad2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAchievements } from '../../hooks/useAchievements';
import { useSound } from '../../contexts/SoundContext';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

const SnakeGame = ({ isOpen, onClose }) => {
  const { unlockAchievement } = useAchievements();
  const { playGameSound } = useSound();
  const [snake, setSnake] = useState([[10, 10]]);
  const [food, setFood] = useState([15, 15]);
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const gameLoopRef = useRef(null);
  const directionRef = useRef('RIGHT');

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('snake-highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Generate random food position
  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = [
        Math.floor(Math.random() * GRID_SIZE),
        Math.floor(Math.random() * GRID_SIZE)
      ];
    } while (snake.some(([x, y]) => x === newFood[0] && y === newFood[1]));
    return newFood;
  }, [snake]);

  // Move snake
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const newSnake = [...prevSnake];
      const head = [...newSnake[0]];

      // Update head position based on direction
      switch (directionRef.current) {
        case 'UP':
          head[1] -= 1;
          break;
        case 'DOWN':
          head[1] += 1;
          break;
        case 'LEFT':
          head[0] -= 1;
          break;
        case 'RIGHT':
          head[0] += 1;
          break;
        default:
          break;
      }

      // Check wall collision
      if (head[0] < 0 || head[0] >= GRID_SIZE || head[1] < 0 || head[1] >= GRID_SIZE) {
        setGameOver(true);
        playGameSound('die');
        return prevSnake;
      }

      // Check self collision
      if (newSnake.some(([x, y]) => x === head[0] && y === head[1])) {
        setGameOver(true);
        playGameSound('die');
        return prevSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head[0] === food[0] && head[1] === food[1]) {
        playGameSound('eat');
        const newScore = score + 10;
        setScore(newScore);
        setFood(generateFood());

        // Increase speed slightly
        setSpeed(prev => Math.max(50, prev - 5));

        // Unlock achievements
        if (newScore >= 50) unlockAchievement('snakeMaster');
        if (newScore >= 100) unlockAchievement('snakeGod');

        // Update high score
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('snake-highscore', newScore.toString());
        }
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, gameOver, isPaused, score, highScore, generateFood, unlockAchievement]);

  // Game loop
  useEffect(() => {
    if (!isOpen) return;

    gameLoopRef.current = setInterval(moveSnake, speed);
    return () => clearInterval(gameLoopRef.current);
  }, [isOpen, speed, moveSnake]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;

      const key = e.key;
      const currentDir = directionRef.current;

      // Prevent opposite direction
      if (key === 'ArrowUp' && currentDir !== 'DOWN') {
        directionRef.current = 'UP';
        setDirection('UP');
      } else if (key === 'ArrowDown' && currentDir !== 'UP') {
        directionRef.current = 'DOWN';
        setDirection('DOWN');
      } else if (key === 'ArrowLeft' && currentDir !== 'RIGHT') {
        directionRef.current = 'LEFT';
        setDirection('LEFT');
      } else if (key === 'ArrowRight' && currentDir !== 'LEFT') {
        directionRef.current = 'RIGHT';
        setDirection('RIGHT');
      } else if (key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      } else if (key === 'r' && gameOver) {
        resetGame();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, gameOver]);

  const resetGame = () => {
    setSnake([[10, 10]]);
    setFood([15, 15]);
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsPaused(false);
  };

  // Touch swipe controls
  const touchStartRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };
    const handleTouchEnd = (e) => {
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const minSwipe = 30;
      if (Math.max(absDx, absDy) < minSwipe) return;
      const currentDir = directionRef.current;
      if (absDx > absDy) {
        if (dx > 0 && currentDir !== 'LEFT') { directionRef.current = 'RIGHT'; setDirection('RIGHT'); }
        else if (dx < 0 && currentDir !== 'RIGHT') { directionRef.current = 'LEFT'; setDirection('LEFT'); }
      } else {
        if (dy > 0 && currentDir !== 'UP') { directionRef.current = 'DOWN'; setDirection('DOWN'); }
        else if (dy < 0 && currentDir !== 'DOWN') { directionRef.current = 'UP'; setDirection('UP'); }
      }
      touchStartRef.current = null;
    };
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen]);

  // D-pad button handler
  const handleDPad = (dir) => {
    const currentDir = directionRef.current;
    if (dir === 'UP' && currentDir !== 'DOWN') { directionRef.current = 'UP'; setDirection('UP'); }
    else if (dir === 'DOWN' && currentDir !== 'UP') { directionRef.current = 'DOWN'; setDirection('DOWN'); }
    else if (dir === 'LEFT' && currentDir !== 'RIGHT') { directionRef.current = 'LEFT'; setDirection('LEFT'); }
    else if (dir === 'RIGHT' && currentDir !== 'LEFT') { directionRef.current = 'RIGHT'; setDirection('RIGHT'); }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2147483648] flex items-center justify-center bg-black/50 backdrop-blur-sm pb-16"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-zinc-900 rounded-xl border border-zinc-700 shadow-2xl p-4 sm:p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Gamepad2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-white">Snake Game</h2>
                <p className="text-xs text-zinc-400">Classic arcade fun!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Score */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-zinc-800 rounded-lg p-3">
              <div className="text-xs text-zinc-400">Score</div>
              <div className="text-2xl font-bold text-green-400">{score}</div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-3">
              <div className="text-xs text-zinc-400 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> High Score
              </div>
              <div className="text-2xl font-bold text-yellow-400">{highScore}</div>
            </div>
          </div>

          {/* Game Board */}
          <div className="relative bg-zinc-950 rounded-lg p-1 sm:p-2 mb-4 border-2 border-zinc-800">
            <div
              className="relative mx-auto bg-black aspect-square"
              style={{
                width: 'min(100%, 400px)',
                maxWidth: '100%',
              }}
            >
              {/* Snake */}
              {snake.map(([x, y], index) => (
                <motion.div
                  key={`snake-${index}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute rounded-sm ${index === 0 ? 'bg-green-400' : 'bg-green-500'
                    }`}
                  style={{
                    left: `${(x / GRID_SIZE) * 100}%`,
                    top: `${(y / GRID_SIZE) * 100}%`,
                    width: `${(1 / GRID_SIZE) * 100}%`,
                    height: `${(1 / GRID_SIZE) * 100}%`,
                    padding: '1px',
                    backgroundClip: 'content-box',
                  }}
                />
              ))}

              {/* Food */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="absolute bg-red-500 rounded-full"
                style={{
                  left: `${(food[0] / GRID_SIZE) * 100}%`,
                  top: `${(food[1] / GRID_SIZE) * 100}%`,
                  width: `${(1 / GRID_SIZE) * 100}%`,
                  height: `${(1 / GRID_SIZE) * 100}%`,
                  padding: '1px',
                  backgroundClip: 'content-box',
                }}
              />

              {/* Game Over Overlay */}
              {gameOver && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center"
                >
                  <div className="text-3xl font-bold text-red-400 mb-2">Game Over!</div>
                  <div className="text-xl text-white mb-4">Score: {score}</div>
                  <button
                    onClick={resetGame}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Play Again (R)
                  </button>
                </motion.div>
              )}

              {/* Pause Overlay */}
              {isPaused && !gameOver && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/80 flex items-center justify-center"
                >
                  <div className="text-2xl font-bold text-white">PAUSED</div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            {/* D-Pad for touch devices */}
            <div className="sm:hidden flex flex-col items-center gap-1">
              <button
                onTouchStart={(e) => { e.preventDefault(); handleDPad('UP'); }}
                onClick={() => handleDPad('UP')}
                className="w-14 h-14 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-xl flex items-center justify-center text-white transition-colors os-touch-target"
              >
                <ChevronUp size={28} />
              </button>
              <div className="flex gap-1">
                <button
                  onTouchStart={(e) => { e.preventDefault(); handleDPad('LEFT'); }}
                  onClick={() => handleDPad('LEFT')}
                  className="w-14 h-14 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-xl flex items-center justify-center text-white transition-colors os-touch-target"
                >
                  <ChevronLeft size={28} />
                </button>
                <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center">
                  <Gamepad2 size={20} className="text-zinc-600" />
                </div>
                <button
                  onTouchStart={(e) => { e.preventDefault(); handleDPad('RIGHT'); }}
                  onClick={() => handleDPad('RIGHT')}
                  className="w-14 h-14 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-xl flex items-center justify-center text-white transition-colors os-touch-target"
                >
                  <ChevronRight size={28} />
                </button>
              </div>
              <button
                onTouchStart={(e) => { e.preventDefault(); handleDPad('DOWN'); }}
                onClick={() => handleDPad('DOWN')}
                className="w-14 h-14 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-xl flex items-center justify-center text-white transition-colors os-touch-target"
              >
                <ChevronDown size={28} />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={resetGame}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={() => setIsPaused(prev => !prev)}
                disabled={gameOver}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            </div>

            <div className="text-xs text-zinc-400 text-center space-y-1">
              <div className="hidden sm:block">Use Arrow Keys to control</div>
              <div className="sm:hidden">Swipe or use D-pad to control</div>
              <div className="hidden sm:block">Space to pause • R to restart</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SnakeGame;
