/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // ✅ Set Poppins as the default sans font
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: "#ba2525", 
      }
    },
  },
  plugins: [],
}