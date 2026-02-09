import React from 'react';
import { motion } from 'framer-motion';

/**
 * Loading skeleton for StatusCardWidget
 * Shows animated placeholder while profile data loads
 */
const StatusCardSkeleton = ({ className = '' }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative overflow-hidden rounded-2xl border border-white/10 ${className}`}
        >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 opacity-20" />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />

            {/* Content */}
            <div className="relative p-3.5 text-white">
                {/* Header Row: Photo + Info + Status Dot */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
                    {/* Profile Photo Skeleton */}
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
                    </div>

                    {/* Name + Role + Location Skeleton */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="h-3 bg-white/10 rounded w-24 animate-pulse" />
                        <div className="h-2.5 bg-white/10 rounded w-32 animate-pulse" />
                        <div className="h-2 bg-white/10 rounded w-20 animate-pulse" />
                    </div>

                    {/* Status Indicator Skeleton */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
                        <motion.div
                            className="w-3 h-3 rounded-full bg-emerald-500/50"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.7, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <div className="h-2 w-8 bg-white/10 rounded animate-pulse" />
                    </div>
                </div>

                {/* Available For Tags Skeleton */}
                <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-4 h-4 bg-white/10 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
                </div>

                {/* Connect Section Skeleton */}
                <div className="pt-3 border-t border-white/10">
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-2 w-12 bg-white/10 rounded animate-pulse" />
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-white/5 animate-pulse" />
                            <div className="w-7 h-7 rounded-lg bg-white/5 animate-pulse" />
                            <div className="w-7 h-7 rounded-lg bg-white/5 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]">
                <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
            </div>
        </motion.div>
    );
};

export default StatusCardSkeleton;
