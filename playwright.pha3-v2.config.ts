import { defineConfig } from "playwright/test";

// PHA3 ChatGPT visual QA — round 1 fix (Task A/B/C).
//
// snapshotPathTemplate pins toHaveScreenshot()'s baseline location to the
// exact evidence directory the task requires (.webby/qa/pha3-v2/round-1/
// master/<name>.png) instead of Playwright's default {testFileName}-snapshots
// convention — the master files placed there are byte-identical copies of
// the approved PHA1 masters (see tests/visual/pha3-v2-capture.spec.ts's
// beforeAll), never re-encoded, never overwritten by --update-snapshots
// (that flag is never invoked by any script in this repo).
//
// webServer runs a real production build with VISUAL_FIXTURE_V2=true so
// captures reflect neither `next dev`'s floating devtools indicator nor
// live/mock provider data — deterministic PHA1-matching fixture content only.
const PORT = 3102;

export default defineConfig({
  testDir: "./tests/visual",
  testMatch: /pha3-v2-capture\.spec\.ts/,
  timeout: 30_000,
  snapshotPathTemplate: ".webby/qa/pha3-v2/round-1/master/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      threshold: 0.12,
      maxDiffPixelRatio: 0.005,
    },
  },
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
