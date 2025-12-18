/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2E3192", // Indigo
          hover: "#1F2266",
        },
        accent: {
          DEFAULT: "#00A651", // Green
          hover: "#008C44",
        },
        warning: "#FCB900", // Yellow
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
