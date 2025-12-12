import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#f4a100",
        dark: "#111827",
        light: "#f9fafb",
      },
    },
  },
  plugins: [],
};

export default config;
