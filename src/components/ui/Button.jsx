import React from 'react';
import { motion } from 'framer-motion';

/**
 * Button component with micro-interactions and animations
 * Variants: primary, secondary, ghost, danger, success
 * Sizes: sm, md, lg
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    fullWidth = false,
    onClick,
    className = '',
    ...props
}) => {
    const baseClasses = `
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${className}
    `;

    const variants = {
        primary: `
            bg-blue-600 hover:bg-blue-700 active:bg-blue-800
            text-white
            focus:ring-blue-500
            shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
        `,
        secondary: `
            bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-800
            text-white
            focus:ring-zinc-500
            shadow-lg shadow-zinc-500/20 hover:shadow-xl hover:shadow-zinc-500/30
        `,
        ghost: `
            bg-transparent hover:bg-white/10 active:bg-white/20
            text-zinc-300 hover:text-white
            focus:ring-white/50
        `,
        danger: `
            bg-red-600 hover:bg-red-700 active:bg-red-800
            text-white
            focus:ring-red-500
            shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40
        `,
        success: `
            bg-green-600 hover:bg-green-700 active:bg-green-800
            text-white
            focus:ring-green-500
            shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40
        `,
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <motion.button
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            onClick={disabled || loading ? undefined : onClick}
            disabled={disabled || loading}
            className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin h-4 w-4"
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
            )}
            
            {icon && iconPosition === 'left' && !loading && (
                <span className="flex-shrink-0">{icon}</span>
            )}
            
            {children}
            
            {icon && iconPosition === 'right' && !loading && (
                <span className="flex-shrink-0">{icon}</span>
            )}
        </motion.button>
    );
};

export default Button;
