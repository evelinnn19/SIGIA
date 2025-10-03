/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}",
    "./src/**/*.{html,js}"
  ],  
  theme: {
    extend: {
      colors: {
        cream: "#F7EEC3",
        greenbg: "#D3E6B9",
        mint: "#C5DBA7",
        brown: "#4D3C2D",
        browndark: "#3D3023",
      },
      fontFamily: {
        jakarta: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
