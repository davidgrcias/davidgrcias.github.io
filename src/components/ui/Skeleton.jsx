import React from 'react';
import { motion } from 'framer-motion';

/**
 * Skeleton loader component for content loading states
 * Variants: text, circular, rectangular
 */
const Skeleton = ({ 
    variant = 'rectangular',
    width = '100%',
    height,
    className = '',
    animation = true,
}) => {
    const baseClasses = `bg-zinc-700/50 ${animation ? 'animate-pulse' : ''}`;

    const variantStyles = {
        text: 'rounded h-4',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    const style = {
        width,
        height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? width : '100px'),
    };

    return (
        <div
            className={`${baseClasses} ${variantStyles[variant]} ${className}`}
            style={style}
        />
    );
};

// Skeleton presets for common patterns
export const SkeletonCard = () => (
    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6 space-y-4">
        <Skeleton variant="rectangular" height="200px" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
        <div className="flex gap-2">
            <Skeleton variant="circular" width="40px" height="40px" />
            <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="70%" />
                <Skeleton variant="text" width="50%" />
            </div>
        </div>
    </div>
);

export const SkeletonList = ({ count = 3 }) => (
    <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-lg">
                <Skeleton variant="circular" width="48px" height="48px" />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                </div>
            </div>
        ))}
    </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
    <div className="space-y-2">
        {/* Header */}
        <div className="flex gap-4 p-3 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-lg">
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} variant="text" width={`${100 / columns}%`} />
            ))}
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-4 p-3 bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/30 rounded-lg">
                {Array.from({ length: columns }).map((_, colIndex) => (
                    <Skeleton key={colIndex} variant="text" width={`${100 / columns}%`} />
                ))}
            </div>
        ))}
    </div>
);

export default Skeleton;
