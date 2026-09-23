/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFDF5",
        brutal: {
          black: "#000000",
          yellow: "#FFE500",
          pink: "#FF4D8D",
          cyan: "#00D9FF",
          green: "#B6FF00",
          purple: "#A388EE",
          orange: "#FF6B00",
          bg: "#FFFDF5",
          muted: "#E2DEC9",
          card: "#FFFFFF",
        },
      },
      boxShadow: {
        brutal: "4px 4px 0px 0px #000000",
        "brutal-lg": "6px 6px 0px 0px #000000",
        "brutal-xl": "8px 8px 0px 0px #000000",
        "brutal-sm": "2px 2px 0px 0px #000000",
        "brutal-hover": "2px 2px 0px 0px #000000",
      },
      borderWidth: {
        "3": "3px",
        "4": "4px",
      },
      fontFamily: {
        sans: ["var(--font-heading)", "var(--font-sans)", "sans-serif"],
        heading: ["var(--font-heading)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
