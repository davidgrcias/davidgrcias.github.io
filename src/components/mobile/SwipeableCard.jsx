import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Trash2, Archive, Check } from 'lucide-react';

/**
 * Swipeable Card Component
 * Tinder-style swipeable cards with actions
 */
const SwipeableCard = ({ 
    children,
    onSwipeLeft,
    onSwipeRight,
    onDelete,
    leftAction = { label: 'Delete', icon: <Trash2 size={20} />, color: 'bg-red-500' },
    rightAction = { label: 'Archive', icon: <Archive size={20} />, color: 'bg-blue-500' },
    swipeThreshold = 100,
}) => {
    const [exitX, setExitX] = useState(0);
    const x = useMotionValue(0);
    
    const background = useTransform(
        x,
        [-swipeThreshold, 0, swipeThreshold],
        ['rgb(239, 68, 68)', 'rgb(63, 63, 70)', 'rgb(59, 130, 246)']
    );

    const leftActionOpacity = useTransform(x, [-swipeThreshold, 0], [1, 0]);
    const rightActionOpacity = useTransform(x, [0, swipeThreshold], [0, 1]);

    const handleDragEnd = (event, info) => {
        const swipeDistance = info.offset.x;
        const swipeVelocity = info.velocity.x;

        // Swipe left (delete)
        if (swipeDistance < -swipeThreshold || swipeVelocity < -500) {
            setExitX(-1000);
            setTimeout(() => {
                if (onSwipeLeft) onSwipeLeft();
                if (onDelete) onDelete();
            }, 200);
        }
        // Swipe right (archive)
        else if (swipeDistance > swipeThreshold || swipeVelocity > 500) {
            setExitX(1000);
            setTimeout(() => {
                if (onSwipeRight) onSwipeRight();
            }, 200);
        }
    };

    return (
        <div className="relative h-full">
            {/* Background Actions */}
            <div className="absolute inset-0 flex items-center justify-between px-6 rounded-xl overflow-hidden">
                <motion.div
                    style={{ opacity: leftActionOpacity }}
                    className={`${leftAction.color} p-3 rounded-lg text-white flex items-center gap-2`}
                >
                    {leftAction.icon}
                    <span className="font-medium">{leftAction.label}</span>
                </motion.div>
                <motion.div
                    style={{ opacity: rightActionOpacity }}
                    className={`${rightAction.color} p-3 rounded-lg text-white flex items-center gap-2`}
                >
                    {rightAction.icon}
                    <span className="font-medium">{rightAction.label}</span>
                </motion.div>
            </div>

            {/* Card */}
            <motion.div
                style={{ x, background }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
                animate={exitX !== 0 ? { x: exitX } : {}}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="relative rounded-xl cursor-grab active:cursor-grabbing"
            >
                {children}
            </motion.div>
        </div>
    );
};

// Swipeable List - Container for multiple swipeable cards
export const SwipeableList = ({ items, renderItem, onItemRemove }) => {
    const [visibleItems, setVisibleItems] = useState(items);

    const handleRemove = (id) => {
        setVisibleItems((current) => current.filter((item) => item.id !== id));
        if (onItemRemove) onItemRemove(id);
    };

    return (
        <div className="space-y-3">
            {visibleItems.map((item) => (
                <SwipeableCard
                    key={item.id}
                    onDelete={() => handleRemove(item.id)}
                    onSwipeRight={() => console.log('Archived:', item.id)}
                >
                    {renderItem(item)}
                </SwipeableCard>
            ))}
        </div>
    );
};

export default SwipeableCard;
