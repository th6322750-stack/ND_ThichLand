import { defineConfig } from "playwright/test";

// PHA3 ChatGPT visual QA — round 3 exact density/typography correction.
// Same canonical capture mechanics as rounds 1-2: exact viewport CSS + DSF,
// fullPage:false, dimensions asserted. Output goes to a separate
// .webby/qa/pha3-v2/round-3/ evidence tree — round-1/round-2 evidence is
// never touched. Master bytes under round-3/master/ are the same
// immutable, byte-identical copies used in every prior round.
const PORT = 3105;

export default defineConfig({
  testDir: "./tests/visual",
  testMatch: /pha3-v2-capture-round3\.spec\.ts/,
  timeout: 30_000,
  snapshotPathTemplate: ".webby/qa/pha3-v2/round-3/master/{arg}{ext}",
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
