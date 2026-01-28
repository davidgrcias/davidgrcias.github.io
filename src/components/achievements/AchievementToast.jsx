import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Crown, Award, Sparkles, Target, Rocket } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from '../../hooks/useWindowSize';

const AchievementToast = ({ achievement, isVisible, onClose }) => {
    const { width, height } = useWindowSize();

    if (!achievement) return null;

    // Icon mapping for different achievement types
    const iconMap = {
        trophy: Trophy,
        star: Star,
        zap: Zap,
        crown: Crown,
        award: Award,
        sparkles: Sparkles,
        target: Target,
        rocket: Rocket,
    };

    const Icon = iconMap[achievement.icon] || Trophy;

    // Rarity colors
    const rarityColors = {
        common: {
            gradient: 'from-slate-500 to-slate-700',
            glow: 'shadow-slate-500/50',
            text: 'text-slate-200',
        },
        rare: {
            gradient: 'from-blue-500 to-blue-700',
            glow: 'shadow-blue-500/50',
            text: 'text-blue-200',
        },
        epic: {
            gradient: 'from-purple-500 to-purple-700',
            glow: 'shadow-purple-500/50',
            text: 'text-purple-200',
        },
        legendary: {
            gradient: 'from-amber-400 to-orange-600',
            glow: 'shadow-amber-500/50',
            text: 'text-amber-100',
        },
    };

    const colors = rarityColors[achievement.rarity] || rarityColors.common;

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Confetti for legendary achievements */}
                    {achievement.rarity === 'legendary' && (
                        <Confetti
                            width={width}
                            height={height}
                            recycle={false}
                            numberOfPieces={200}
                            gravity={0.3}
                            colors={['#FFD700', '#FFA500', '#FF6347', '#FF69B4']}
                        />
                    )}

                    <motion.div
                        initial={{ x: 400, opacity: 0, scale: 0.8 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        exit={{ x: 400, opacity: 0, scale: 0.8 }}
                        transition={{ 
                            type: 'spring', 
                            stiffness: 200, 
                            damping: 20,
                            duration: 0.5 
                        }}
                        className="fixed top-20 right-6 z-[10000] max-w-sm"
                    >
                        <div className={`
                            relative overflow-hidden rounded-xl
                            bg-gradient-to-br ${colors.gradient}
                            ${colors.glow} shadow-2xl
                            border border-white/20
                            backdrop-blur-sm
                        `}>
                            {/* Animated background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                            
                            {/* Content */}
                            <div className="relative p-6">
                                {/* Header */}
                                <div className="flex items-start gap-4 mb-3">
                                    {/* Icon with pulse animation */}
                                    <motion.div
                                        animate={{ 
                                            scale: [1, 1.2, 1],
                                            rotate: [0, 10, -10, 0]
                                        }}
                                        transition={{ 
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatDelay: 3
                                        }}
                                        className="flex-shrink-0"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                                            <Icon className="w-8 h-8 text-white" />
                                        </div>
                                    </motion.div>

                                    {/* Text */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                                                Achievement Unlocked
                                            </span>
                                            <span className={`
                                                text-xs font-bold uppercase tracking-wider
                                                px-2 py-0.5 rounded-full
                                                bg-white/20 backdrop-blur-sm
                                                ${colors.text}
                                            `}>
                                                {achievement.rarity}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-1">
                                            {achievement.title}
                                        </h3>
                                        <p className="text-sm text-white/90">
                                            {achievement.description}
                                        </p>
                                    </div>

                                    {/* Close button */}
                                    <button
                                        onClick={onClose}
                                        className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white/70 hover:text-white"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Progress indicator */}
                                <div className="flex items-center gap-2 text-xs text-white/80">
                                    <Sparkles className="w-3 h-3" />
                                    <span>+{achievement.points} XP</span>
                                    {achievement.progress && (
                                        <>
                                            <span className="text-white/50">•</span>
                                            <span>{achievement.progress}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Shine effect */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                initial={{ x: '-100%' }}
                                animate={{ x: '200%' }}
                                transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 5
                                }}
                                style={{ skewX: -20 }}
                            />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AchievementToast;
