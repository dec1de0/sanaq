/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1a2a6c",
          light: "#2a3d8f",
          dark: "#111d4a",
        },
        // White + light-green palette
        "app-bg": "#f4fbf4",
        "app-border": "#c6dec6",
        "accent-light": "#e2f5e2",
        "cell-selected": "#b5d9b5",
        "cell-highlight-row": "#cce8cc",
        "cell-highlight-box": "#e8f5e8",
        "cell-same": "#9ecf9e",
        "cell-error": "#FCEBEB",
        "error-text": "#A32D2D",
        "hint-text": "#276327",
        "user-correct": "#276327",
        "user-number": "#1e5c1e",
      },
      fontFamily: {
        sans: ["var(--font-rubik)", "Rubik", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-rubik)", "Rubik", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
