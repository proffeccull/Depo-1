const { colors } = require('./src/theme/colors');
const { spacing } = require('./src/theme/spacing');
const { typography } = require('./src/theme/typography');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ...colors,
        primary: {
          '50': '#f0f7ff',
          '100': '#e0efff',
          '200': '#c1e0ff',
          '300': '#a2d1ff',
          '400': '#83c2ff',
          '500': '#64b3ff', // Your primary color
          '600': '#45a4ff',
          '700': '#2695ff',
          '800': '#0786ff',
          '900': '#006fff',
        },
        secondary: {
          '50': '#f5f3ff',
          '100': '#ede9fe',
          '200': '#ddd6fe',
          '300': '#c4b5fd',
          '400': '#a78bfa',
          '500': '#8b5cf6', // Your secondary color
          '600': '#7c3aed',
          '700': '#6d28d9',
          '800': '#5b21b6',
          '900': '#4c1d95',
        },
        neutral: {
          '50': '#f8fafc',
          '100': '#f1f5f9',
          '200': '#e2e8f0',
          '300': '#cbd5e1',
          '400': '#94a3b8',
          '500': '#64748b',
          '600': '#475569',
          '700': '#334155',
          '800': '#1e293b',
          '900': '#0f172a',
        },
      },
      spacing: {
        ...spacing,
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        '': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      ...typography,
    },
  },
  plugins: [],
};