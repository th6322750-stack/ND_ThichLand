import { defineConfig } from "playwright/test";

// PHA3 ChatGPT visual QA — round 2 structural correction.
//
// Same canonical capture mechanics as playwright.pha3-v2.config.ts (round 1):
// exact viewport CSS + DSF, fullPage:false, dimension asserted. Output goes
// to a separate .webby/qa/pha3-v2/round-2/ evidence tree so round-1's
// already-reviewed evidence is never overwritten. The master bytes staged
// under round-2/master/ are the same immutable, byte-identical copies used
// in round 1 (never regenerated, never re-encoded).
const PORT = 3103;

export default defineConfig({
  testDir: "./tests/visual",
  testMatch: /pha3-v2-capture-round2\.spec\.ts/,
  timeout: 30_000,
  snapshotPathTemplate: ".webby/qa/pha3-v2/round-2/master/{arg}{ext}",
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
