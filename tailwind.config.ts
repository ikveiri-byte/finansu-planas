import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-dm-sans)"],
        body: ["var(--font-dm-sans)"],
      },
      colors: {
        paper: "#f1f5f9",
        ink: "#111111",
        card: "#FFFFFF",
        line: "#e5e7eb",
        muted: "#9ca3af",
        muted2: "#6b7280",
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};
export default config;
