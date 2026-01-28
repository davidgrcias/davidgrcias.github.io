import React from 'react';
import { motion } from 'framer-motion';

/**
 * Card component with hover effects and glass morphism
 * Variants: default, glass, gradient
 */
const Card = ({
    children,
    variant = 'default',
    hover = true,
    className = '',
    onClick,
    ...props
}) => {
    const baseClasses = `
        rounded-xl
        transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
    `;

    const variants = {
        default: `
            bg-zinc-800/50 backdrop-blur-sm
            border border-zinc-700/50
            ${hover ? 'hover:border-zinc-600 hover:shadow-xl hover:shadow-zinc-900/50' : ''}
        `,
        glass: `
            bg-white/5 backdrop-blur-md
            border border-white/10
            ${hover ? 'hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50' : ''}
        `,
        gradient: `
            bg-gradient-to-br from-zinc-800 to-zinc-900
            border border-zinc-700
            ${hover ? 'hover:from-zinc-700 hover:to-zinc-800 hover:shadow-2xl hover:shadow-blue-500/20' : ''}
        `,
    };

    const motionProps = hover
        ? {
              whileHover: { y: -4, transition: { duration: 0.2 } },
              whileTap: onClick ? { scale: 0.98 } : {},
          }
        : {};

    return (
        <motion.div
            {...motionProps}
            className={`${baseClasses} ${variants[variant]}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.div>
    );
};

// Card sub-components
Card.Header = ({ children, className = '' }) => (
    <div className={`p-6 pb-4 border-b border-white/10 ${className}`}>
        {children}
    </div>
);

Card.Body = ({ children, className = '' }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);

Card.Footer = ({ children, className = '' }) => (
    <div className={`p-6 pt-4 border-t border-white/10 ${className}`}>
        {children}
    </div>
);

export default Card;
