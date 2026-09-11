import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    // Real scrypt hashing and dynamic re-imports are intentionally tested.
    // Fifty-plus parallel files can contend for CPU on CI, so leave enough
    // room for the cryptographic work without weakening any assertion.
    testTimeout: 25000,
  },
  resolve: {
    alias: {
      "server-only": path.resolve(rootDir, "./tests/stubs/server-only.ts"),
      "@": path.resolve(rootDir, "."),
    },
  },
});
