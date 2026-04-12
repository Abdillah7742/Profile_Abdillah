/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./*.js"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Core blue from references
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        darkbg: '#121212',
        darkcard: '#1e1e1e',
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'], // For the bold "DESIGNER" look
        sans: ['Inter', 'sans-serif'], // For clean text
      }
    },
  },
  plugins: [],
}
