import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface-2)",
        foreground: "var(--fg)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        border: "var(--border)",
        hair: "var(--hair)",
        ink: "var(--ink)",
        onink: "var(--on-ink)",
        accent: "var(--accent)",
        good: "var(--good)",
        warn: "var(--warn)",
        neon: "var(--fg)",
        neon2: "var(--accent)",
      },
      borderRadius: {
        card: "var(--r-card)",
        lg2: "var(--r-lg)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        soft: "var(--shadow-soft)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Arial", "Helvetica", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
