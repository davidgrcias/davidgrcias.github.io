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

    // Rarity colors (Simplified for pill style)
    const rarityColors = {
        common: 'text-slate-400',
        rare: 'text-blue-400',
        epic: 'text-purple-400',
        legendary: 'text-amber-400',
    };

    const iconColor = rarityColors[achievement.rarity] || rarityColors.common;

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
                        layout
                        initial={{ y: -50, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ 
                            y: -20, 
                            opacity: 0, 
                            scale: 0.9, 
                            transition: { duration: 0.5, ease: "easeInOut" } 
                        }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 pl-3 pr-4 py-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl min-w-[240px] max-w-[90vw]"
                    >
                        {/* Icon Bubble */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5 ${iconColor}`}>
                            <Icon size={16} />
                        </div>

                        {/* Content */}
                        <div className="flex flex-col flex-1 min-w-0 mr-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 leading-none mb-1">
                                Achievement Unlocked
                            </span>
                            <span className="text-sm font-bold text-white leading-none truncate">
                                {achievement.title}
                            </span>
                        </div>

                        {/* Points Badge */}
                        <div className="flex items-center gap-1 pl-3 border-l border-white/10 mr-2">
                             <span className="text-xs font-bold text-yellow-400">+{achievement.points}</span>
                             <span className="text-[10px] text-yellow-400/70">XP</span>
                        </div>
                        
                        {/* Close Button - Explicitly Interactive */}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-white/70 hover:text-white"
                        >
                            <span className="text-[10px]">✕</span>
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AchievementToast;
