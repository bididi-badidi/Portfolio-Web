/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        lightGray: "#efefef",
        slate: "#0f172a",
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--color-surface)",
        elevated: "var(--color-elevated)",
        subtle: "var(--color-subtle)",
        bright: "var(--color-bright)",
        accent: "var(--color-accent)",
        "accent-light": "var(--color-accent-light)",
      },
    },
  },
};
