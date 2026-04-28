/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#e8edf4',
          100: '#c5d0e3',
          200: '#9fb0cf',
          300: '#7890bb',
          400: '#5878ad',
          500: '#3860a0',
          600: '#2d5494',
          700: '#234684',
          800: '#1e3a5f',
          900: '#152c4a',
        },
        gold: {
          50:  '#fdf8e7',
          100: '#faedc3',
          200: '#f7e19b',
          300: '#f3d571',
          400: '#f0cb52',
          500: '#d4af37',
          600: '#c09a27',
          700: '#a8821b',
          800: '#906b12',
          900: '#70500a',
        },
        cream: '#f8f9fa',
        'light-gray': '#e9ecef',
        'dark-text': '#2c3e50',
        'mid-gray': '#6c757d',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 16px 0 rgba(30,58,95,0.08)',
        'card-hover': '0 8px 32px 0 rgba(30,58,95,0.16)',
        'nav': '0 2px 12px 0 rgba(30,58,95,0.10)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
