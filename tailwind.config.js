/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2E7D32",
        secondary: "#66BB6A",
        background: "#F4F8F4",
      },
      fontFamily: {
        main: ["Tajawal", "sans-serif"],
      },
    },
  },
  plugins: [],
}

