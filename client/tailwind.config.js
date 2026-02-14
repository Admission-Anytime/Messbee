/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // ✅ Sets Urbanist as the default font for the whole app
        sans: ['Urbanist', 'Inter', 'system-ui', 'sans-serif'],
        
        // Optional: Keep 'tight' if you use it specifically
        tight: ['Inter Tight', 'sans-serif'],
      },
      colors: {
        primary: "#ba2525", 
      }
    },
  },
  plugins: [],
}