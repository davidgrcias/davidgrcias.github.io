/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  safelist: [
    "border-blue-500/50",
    "border-cyan-500/50",
    "border-green-500/50",
    "border-orange-500/50",
    "shadow-blue-500/20",
    "shadow-cyan-500/20",
    "shadow-green-500/20",
    "shadow-orange-500/20",
    "text-blue-500",
    "text-cyan-500",
    "text-green-500",
    "text-orange-500",
  ],
  theme: {
    extend: {
      perspective: {
        '1000': '1000px',
        '2000': '2000px',
        '3000': '3000px',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 3s ease-in-out infinite',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    },
  ],
};
