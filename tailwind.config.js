/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        primary: { 50: '#f0f9ff', 500: '#0ea5e9', 600: '#0284c7', 900: '#0c4a6e' },
        secondary: { 500: '#d946ef' },
      },
      fontFamily: {
        sans: ['Inter', 'Cairo', 'sans-serif'],
      }
    },
  },
  plugins: [],
}