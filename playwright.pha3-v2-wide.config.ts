import { defineConfig } from "playwright/test";

// USER_APPROVED_PREMIUM_WIDE_SCALE section 19/20 — evidence capture at
// wide-desktop viewports (1440/1920). There is no prior "wide" master to
// pixelmatch against (the old canonical masters are 935px-scaled captures
// of a narrower design this task explicitly supersedes at >=1440px), so
// this just captures full-page screenshots as visual evidence for review —
// no diff/threshold assertions.
const PORT = 3112;

export default defineConfig({
  testDir: "./tests/visual",
  testMatch: /pha3-v2-wide-scale-capture\.spec\.ts/,
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
      VISUAL_FIXTURE_V2: "true",
    },
  },
});
