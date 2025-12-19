/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable dark mode with class strategy
  content: [
    './public/index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors for Smart Stitch
        'primary-orange': '#FF6B35',
        'primary-navy': '#004E89',
        'secondary-navy': '#003366',
        'accent-teal': '#1A936F',
        
        // Legacy colors (keeping for backward compatibility)
        navy: {
          DEFAULT: '#004E89',
          500: '#004E89',
          600: '#003366',
          700: '#002244',
        },
        gold: '#CBA135',
        'light-grey': '#F8F8F8',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
