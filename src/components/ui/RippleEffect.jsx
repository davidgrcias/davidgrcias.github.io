import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Ripple effect component for buttons and interactive elements
 * Material Design-inspired ripple animation
 */
const RippleEffect = ({ children, className = '', color = 'white', duration = 600 }) => {
    const [ripples, setRipples] = useState([]);

    const handleClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const newRipple = {
            x,
            y,
            size,
            id: Date.now(),
        };

        setRipples([...ripples, newRipple]);

        // Remove ripple after animation
        setTimeout(() => {
            setRipples((current) => current.filter((ripple) => ripple.id !== newRipple.id));
        }, duration);
    };

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            onClick={handleClick}
        >
            {children}
            
            <AnimatePresence>
                {ripples.map((ripple) => (
                    <motion.span
                        key={ripple.id}
                        initial={{ scale: 0, opacity: 0.5 }}
                        animate={{ scale: 2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: duration / 1000, ease: 'easeOut' }}
                        className={`absolute rounded-full pointer-events-none`}
                        style={{
                            left: ripple.x,
                            top: ripple.y,
                            width: ripple.size,
                            height: ripple.size,
                            backgroundColor: color,
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default RippleEffect;
