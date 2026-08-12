import type { Config } from "tailwindcss";

// NOTE: this is a bootstrap-only config so Task 01's `next build` check can pass.
// Task 02 replaces this with the full .webby-locked token theme.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["var(--font-be-vietnam-pro)", "Noto Sans", "Arial", "sans-serif"] },
    },
  },
  plugins: [],
};

export default config;
