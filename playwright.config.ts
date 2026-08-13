import { defineConfig } from "playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  timeout: 30_000,
  use: {
    baseURL: process.env.QA_BASE_URL ?? "http://localhost:3001",
  },
});
