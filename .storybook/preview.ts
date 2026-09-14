import type { Preview } from "@storybook/react";

// 1. Import Design Tokens & Global Tailwind CSS
import "../src/styles/tokens.css";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "app-surface",
      values: [
        {
          name: "app-bg",
          value: "var(--bg-app, #F8FAFC)",
        },
        {
          name: "app-surface",
          value: "var(--bg-surface, #FFFFFF)",
        },
        {
          name: "dark-surface",
          value: "var(--bg-surface-dark, #0F172A)",
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: "Mobile (iPhone / Android)",
          styles: { width: "375px", height: "667px" },
        },
        tablet: {
          name: "Tablet (iPad)",
          styles: { width: "768px", height: "1024px" },
        },
        desktop: {
          name: "Desktop Screen",
          styles: { width: "1440px", height: "900px" },
        },
      },
    },
    layout: "centered",
  },
};

export default preview;
