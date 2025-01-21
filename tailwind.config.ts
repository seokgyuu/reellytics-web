import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import lineClamp from "@tailwindcss/line-clamp";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)", 
        foreground: "var(--foreground)", 
        colors: {
        "header-bg": "rgba(255, 255, 255, 0.9)",
        "header-shadow": "rgba(0, 0, 0, 0.1)",
        },
        primary: {
          light: "#93c5fd",
          DEFAULT: "#3b82f6", 
          dark: "#1e3a8a", 
        },
        secondary: "#64748b", 
        accent: "#f97316", 
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"], 
        mono: ["Fira Code", "ui-monospace"], 
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-in-out",
        bounceSlow: "bounce 2s infinite", 
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" }, 
          "100%": { opacity: "1" }, 
        },
      },
      screens: {
        xs: "480px", 
        sm: "640px", 
        md: "768px", 
        lg: "1024px", 
        xl: "1280px", 
        "2xl": "1536px", 
        "3xl": "1920px", 
      },
    },
  },
  darkMode: "class", 
  plugins: [
    forms, 
    lineClamp, 
    typography, 
  ],
};

export default config satisfies Config;
