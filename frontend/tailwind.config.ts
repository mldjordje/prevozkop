import type { Config } from "tailwindcss";
import { heroui } from "@heroui/theme";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#f4a100",
        dark: "#111827",
        "dark-warm": "#0f0e0c",
        "dark-surface": "#1c1a17",
        light: "#f8f7f4",
        surface: "#ffffff",
        muted: "#5c5851",
        faint: "#9e9891",
      },
      fontFamily: {
        display: ["var(--font-display)", "Barlow Condensed", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "DM Sans", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-shimmer": "linear-gradient(105deg, #f4a100 0%, #ffd166 45%, #f4a100 100%)",
      },
      animation: {
        "slide-progress": "slide-progress 9s linear forwards",
        float: "float 7s ease-in-out infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
      },
      keyframes: {
        "slide-progress": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        gold: "0 20px 60px rgba(244,161,0,0.35)",
        "gold-sm": "0 8px 32px rgba(244,161,0,0.22)",
        "card-hover": "0 24px 64px rgba(0,0,0,0.1), 0 0 0 1px rgba(244,161,0,0.12)",
      },
    },
  },
  plugins: [heroui()],
};

export default config;
