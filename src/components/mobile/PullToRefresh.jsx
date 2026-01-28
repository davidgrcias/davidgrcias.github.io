import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

/**
 * Pull to Refresh Component
 * Native mobile pull-to-refresh functionality
 */
const PullToRefresh = ({ 
    onRefresh, 
    children,
    threshold = 80,
    maxPullDistance = 120,
}) => {
    const [isPulling, setIsPulling] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const containerRef = useRef(null);
    const startYRef = useRef(0);
    const controls = useAnimation();

    const handleTouchStart = (e) => {
        // Only allow pull-to-refresh if at top of scroll
        if (containerRef.current && containerRef.current.scrollTop === 0) {
            startYRef.current = e.touches[0].clientY;
            setIsPulling(true);
        }
    };

    const handleTouchMove = (e) => {
        if (!isPulling || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - startYRef.current;

        // Only pull down
        if (diff > 0) {
            // Apply resistance
            const distance = Math.min(diff * 0.5, maxPullDistance);
            setPullDistance(distance);
            e.preventDefault();
        }
    };

    const handleTouchEnd = async () => {
        if (!isPulling) return;

        setIsPulling(false);

        if (pullDistance >= threshold) {
            // Trigger refresh
            setIsRefreshing(true);
            
            try {
                await onRefresh();
            } catch (error) {
                console.error('Refresh failed:', error);
            } finally {
                setIsRefreshing(false);
                setPullDistance(0);
            }
        } else {
            // Snap back
            setPullDistance(0);
        }
    };

    useEffect(() => {
        // Rotate icon when refreshing
        if (isRefreshing) {
            controls.start({
                rotate: 360,
                transition: {
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear',
                },
            });
        } else {
            controls.stop();
            controls.set({ rotate: 0 });
        }
    }, [isRefreshing, controls]);

    const opacity = Math.min(pullDistance / threshold, 1);
    const scale = Math.min(pullDistance / threshold, 1);

    return (
        <div
            ref={containerRef}
            className="relative overflow-y-auto h-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull indicator */}
            <div 
                className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none z-10"
                style={{
                    height: pullDistance,
                    opacity,
                }}
            >
                <motion.div
                    animate={controls}
                    style={{ scale }}
                    className="w-10 h-10 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 flex items-center justify-center"
                >
                    <RefreshCw 
                        className={`w-5 h-5 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`}
                    />
                </motion.div>
            </div>

            {/* Content */}
            <div style={{ transform: `translateY(${pullDistance}px)` }}>
                {children}
            </div>
        </div>
    );
};

export default PullToRefresh;
