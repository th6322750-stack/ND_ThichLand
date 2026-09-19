import { defineConfig } from "playwright/test";

// PRODUCTION FAIL-CLOSED E2E — `npm run test:e2e:failclosed` (Task 14.2).
//
// Boots `next start` (a real production build; NODE_ENV=production) with
// every Google/admin secret explicitly blanked in its env — the exact
// "deployed but not yet configured" state lib/server/providerMode.ts must
// resolve to "unavailable": no fixture/demo content served as real, no
// write silently reported as a success. This suite proves that contract at
// the browser level; tests/unit/server/productionWithoutConfig.test.ts
// covers the same contract at the unit level.
//
// The env values below are set to "" rather than omitted: Playwright's
// webServer.env is merged into (not a replacement for) the inherited
// process env, so a value that happens to be set in the invoking shell
// would otherwise leak through and silently turn this into a live/mock
// run instead of the fail-closed one it's meant to be. An empty string is
// still falsy to every getXEnv() check in lib/server/env.ts, so this
// guarantees "unavailable" regardless of the ambient shell environment.
//
// `reuseExistingServer: false` (Task 14.5): every run gets a fresh `next
// start` process.
const PORT = 3101;

export default defineConfig({
  testDir: "./tests/e2e-failclosed",
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      GOOGLE_SERVICE_ACCOUNT_EMAIL: "",
      GOOGLE_PRIVATE_KEY: "",
      GOOGLE_RENTAL_SPREADSHEET_ID: "",
      GOOGLE_CMS_SPREADSHEET_ID: "",
      GOOGLE_MEDIA_FOLDER_ID: "",
      ADMIN_EMAIL: "",
      ADMIN_PASSWORD_HASH: "",
      AUTH_SECRET: "",
      RATE_LIMIT_SECRET: "",
    },
  },
});
