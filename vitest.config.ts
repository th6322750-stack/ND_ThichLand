import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    // GĐ6 added real scrypt hashing (N=16384) and dynamic re-imports after
    // vi.resetModules() in several server test files; the default 5000ms
    // is occasionally too tight once ~24 files run in parallel and compete
    // for CPU (confirmed: every observed timeout passed instantly in
    // isolation) — not a functional issue, just parallel-run contention.
    testTimeout: 15000,
  },
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "./tests/stubs/server-only.ts"),
      "@": path.resolve(__dirname, "."),
    },
  },
});
