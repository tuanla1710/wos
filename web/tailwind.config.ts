import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FFFFFF",
        elev: "#FFFFFF",
        hover: "#EFEDE6",
        active: "#E7E5E0",
        line: "#E4E2DB",
        ink: "#1C1917",
        muted: "#78716C",
        faint: "#A8A29E",
        accent: "#1B365D",
        "accent-hover": "#132847",
        "accent-soft": "#E4EAF3",
        sidebar: "#F7F6F3",
        "sidebar-ink": "#1C1917",
        "sidebar-muted": "#78716C",
        overdue: "#B42318",
        "due-today": "#C4320A",
        upcoming: "#175CD3",
        "priority-high": "#9A3412",
        "priority-medium": "#B54708",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        DEFAULT: "8px",
      },
      boxShadow: {
        modal: "0 16px 40px rgba(28,25,23,0.12)",
        popover: "0 8px 24px rgba(28,25,23,0.10)",
        card: "0 0 0 1px #E4E2DB",
        glow: "none",
      },
    },
  },
  plugins: [],
};

export default config;
