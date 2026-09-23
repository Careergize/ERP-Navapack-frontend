import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#1B3A6B",
        blue: "#2E7DB5",
        teal: "#4C9A8E",
        green: "#7AB648",
        ink: "#4A4A4A",
        surface: "#F7F8FA",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "8px",
      },
    },
  },
  plugins: [],
} satisfies Config;
