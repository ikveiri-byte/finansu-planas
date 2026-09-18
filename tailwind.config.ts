import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-gabarito)", "var(--font-dm-sans)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
      },
      colors: {
        paper: "var(--paper)",
        card: "var(--card)",
        sunken: "var(--sunken)",
        "sunken-2": "var(--sunken-2)",
        line: "var(--line)",
        "line-soft": "var(--line-soft)",
        "line-dashed": "var(--line-dashed)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        accent: "var(--accent)",
        "accent-tint": "var(--accent-tint)",
        "accent-deep": "var(--accent-deep)",
        "accent-bar": "var(--accent-bar)",
        "accent-track": "var(--accent-track)",
        saved: "var(--saved)",
        "saved-deep": "var(--saved-deep)",
        danger: "var(--danger)",
        "danger-soft": "var(--danger-soft)",

        /* Laikini seni pavadinimai — kol perdarysiu likusius vaizdus */
        appbg: "var(--paper)",
        surface: "var(--card)",
        "surface-strong": "var(--card)",
        navy: {
          950: "var(--ink)",
          900: "var(--ink)",
          800: "var(--ink-2)",
        },
        blue: {
          700: "var(--accent-deep)",
          600: "var(--accent-deep)",
          500: "var(--accent-deep)",
        },
        cyan: { 400: "var(--accent)" },
        muted: "var(--ink-3)",
        muted2: "var(--ink-3)",
        focus: "var(--accent-deep)",
      },
      borderRadius: {
        panel: "var(--radius-panel)",
        card: "var(--radius-card)",
        control: "var(--radius-control)",
      },
      boxShadow: {
        card: "none",
        fab: "none",
      },
      maxWidth: {
        app: "1440px",
      },
    },
  },
  plugins: [],
};
export default config;
