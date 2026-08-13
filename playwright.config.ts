import { defineConfig } from "playwright/test";

// tests/visual/capture.ts is a standalone screenshot harness run directly via
// tsx, not through the Playwright Test runner — this config is for the real
// e2e specs in tests/e2e that need a live browser (reload/back-forward,
// keyboard navigation, etc.).
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: process.env.QA_BASE_URL ?? "http://localhost:3001",
  },
});
