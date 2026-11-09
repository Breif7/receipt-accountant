import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0f1115",
        panel: "#171a21",
        border: "#272b33",
        accent: "#a855f7",
        income: "#34d399",
        expense: "#f472b6",
      },
    },
  },
  plugins: [],
} satisfies Config;
