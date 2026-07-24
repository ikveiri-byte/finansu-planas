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
        appbg: "var(--app-bg)",
        surface: "var(--surface)",
        "surface-strong": "var(--surface-strong)",
        navy: {
          950: "var(--navy-950)",
          900: "var(--navy-900)",
          800: "var(--navy-800)",
        },
        blue: {
          700: "var(--blue-700)",
          600: "var(--blue-600)",
          500: "var(--blue-500)",
        },
        cyan: {
          400: "var(--cyan-400)",
        },
        ink: "var(--text)",
        muted: "var(--text-secondary)",
        muted2: "var(--muted)",
        line: "var(--line)",
        "line-soft": "var(--line-soft)",
        focus: "var(--focus)",
        danger: "var(--danger)",
        "danger-soft": "var(--danger-soft)",
      },
      borderRadius: {
        panel: "var(--radius-panel)",
        card: "var(--radius-card)",
        control: "var(--radius-control)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        fab: "var(--shadow-fab)",
      },
    },
  },
  plugins: [],
};
export default config;
