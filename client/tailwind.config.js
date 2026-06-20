/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep blue/slate for backgrounds
        brand: {
          dark: "#0B1120", // Main app background
          card: "#1E293B", // Container/Card background
          accent: "#38BDF8", // Bright sky blue for buttons/active states
          muted: "#94A3B8", // Slate gray for secondary text
          white: "#F8FAFC", // Crisp off-white for primary text
        },
      },
    },
  },
  plugins: [],
};
