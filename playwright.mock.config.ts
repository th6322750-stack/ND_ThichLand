import { defineConfig } from "playwright/test";
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD_HASH, TEST_AUTH_SECRET } from "./tests/e2e/testCredentials";

// MOCK/LOCAL UX E2E — `npm run test:e2e:mock` (Task 14.2).
//
// Boots `next dev` itself (NODE_ENV=development -> every domain's
// lib/server/providerMode.ts resolveProviderMode() call resolves to "mock",
// serving the lib/data/*.ts fixtures) with test-only admin credentials
// wired into its env, so the full browser UX — rental filters/search,
// admin login/session flows — can be exercised deterministically without
// any live Google secret and without hand-starting a server first.
//
// `reuseExistingServer: false` (Task 14.5): every run gets a fresh `next
// dev` process, so fixture state can never carry mutations across runs.
//
// See playwright.failclosed.config.ts for the separate "no config at all"
// production-behavior suite, and playwright.live.config.ts for the
// reserved (not yet runnable) live-secrets suite.
const PORT = Number(process.env.PLAYWRIGHT_TEST_PORT ?? 3100);

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      NEXT_DIST_DIR: ".next-playwright-mock",
      ADMIN_EMAIL: TEST_ADMIN_EMAIL,
      ADMIN_PASSWORD_HASH: TEST_ADMIN_PASSWORD_HASH,
      AUTH_SECRET: TEST_AUTH_SECRET,
    },
  },
});
