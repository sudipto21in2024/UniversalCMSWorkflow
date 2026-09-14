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
        app: "var(--bg-app)",
        surface: {
          DEFAULT: "var(--bg-surface)",
          subtle: "var(--bg-surface-subtle)",
          muted: "var(--bg-surface-muted)",
          dark: "var(--bg-surface-dark)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          subtle: "var(--color-primary-subtle)",
        },
        content: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          inverse: "var(--text-inverse)",
        },
        border: {
          DEFAULT: "var(--border-default)",
          subtle: "var(--border-subtle)",
          focus: "var(--border-focus)",
        },
        gold: "var(--text-gold)",
        badge: {
          discount: "var(--badge-discount)",
          new: "var(--badge-new)",
        },
        feedback: {
          success: {
            DEFAULT: "var(--color-success)",
            subtle: "var(--color-success-subtle)",
          },
          error: {
            DEFAULT: "var(--color-error)",
            hover: "var(--color-error-hover)",
            subtle: "var(--color-error-subtle)",
          },
          warning: {
            DEFAULT: "var(--color-warning)",
            subtle: "var(--color-warning-subtle)",
          },
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [require("@tailwindcss/container-queries")],
};
export default config;
