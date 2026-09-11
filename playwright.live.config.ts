import { defineConfig } from "playwright/test";

// LIVE INTEGRATION E2E — `npm run test:e2e:live` (Task 14.2 / 14.6).
// RESERVED for the later live gate (Task 13) — do not invoke until real
// Google/admin runtime secrets are provided.
//
// The npm script runs scripts/check-live-e2e-secrets.mjs first, which
// exits non-zero with LIVE_E2E_SECRETS_MISSING before this config (or
// `next build`) is even reached if any required secret is absent, so this
// file only has to describe how the suite runs once that guard passes.
const PORT = 3102;

export default defineConfig({
  testDir: "./tests/e2e-live",
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
