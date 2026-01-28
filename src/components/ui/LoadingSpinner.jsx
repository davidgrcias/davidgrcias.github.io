import React from 'react';
import { motion } from 'framer-motion';

/**
 * Loading Spinner component with multiple variants
 * Variants: spinner, dots, pulse, bars
 */
const LoadingSpinner = ({ 
    variant = 'spinner', 
    size = 'md', 
    color = 'blue',
    text,
    className = '' 
}) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    const colors = {
        blue: 'text-blue-500',
        green: 'text-green-500',
        red: 'text-red-500',
        purple: 'text-purple-500',
        white: 'text-white',
        gray: 'text-gray-500',
    };

    // Spinner variant (rotating circle)
    if (variant === 'spinner') {
        return (
            <div className={`flex flex-col items-center gap-3 ${className}`}>
                <svg
                    className={`animate-spin ${sizes[size]} ${colors[color]}`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
                {text && <p className="text-sm text-zinc-400">{text}</p>}
            </div>
        );
    }

    // Dots variant (bouncing dots)
    if (variant === 'dots') {
        return (
            <div className={`flex flex-col items-center gap-3 ${className}`}>
                <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className={`${sizes[size]} rounded-full bg-current ${colors[color]}`}
                            animate={{
                                y: ['0%', '-50%', '0%'],
                                opacity: [1, 0.5, 1],
                            }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.1,
                                ease: 'easeInOut',
                            }}
                        />
                    ))}
                </div>
                {text && <p className="text-sm text-zinc-400">{text}</p>}
            </div>
        );
    }

    // Pulse variant (pulsing circle)
    if (variant === 'pulse') {
        return (
            <div className={`flex flex-col items-center gap-3 ${className}`}>
                <motion.div
                    className={`${sizes[size]} rounded-full bg-current ${colors[color]}`}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.5, 1],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                {text && <p className="text-sm text-zinc-400">{text}</p>}
            </div>
        );
    }

    // Bars variant (equalizer bars)
    if (variant === 'bars') {
        return (
            <div className={`flex flex-col items-center gap-3 ${className}`}>
                <div className="flex gap-1 items-end h-8">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                            key={i}
                            className={`w-1.5 bg-current ${colors[color]} rounded-full`}
                            animate={{
                                height: ['20%', '100%', '20%'],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.1,
                                ease: 'easeInOut',
                            }}
                        />
                    ))}
                </div>
                {text && <p className="text-sm text-zinc-400">{text}</p>}
            </div>
        );
    }

    return null;
};

// Full-screen loading overlay
export const LoadingOverlay = ({ text = 'Loading...', variant = 'spinner' }) => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-800/90 backdrop-blur-md border border-zinc-700 rounded-2xl p-8 shadow-2xl"
            >
                <LoadingSpinner variant={variant} size="lg" text={text} />
            </motion.div>
        </div>
    );
};

export default LoadingSpinner;
