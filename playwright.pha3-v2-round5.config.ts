import { defineConfig } from "playwright/test";

// PHA3 ChatGPT visual QA — round 5 geometry completion + mobile convergence.
// Same canonical capture mechanics as rounds 1-4: exact viewport CSS + DSF,
// fullPage:false, dimensions asserted. Output goes to a separate
// .webby/qa/pha3-v2/round-5/ evidence tree — earlier rounds' evidence is
// never touched. This config's webServer does NOT run its own build (round
// 3's evidence was accidentally captured against a stale .next build) —
// round 5's process is: `npm run build` explicitly, THEN this capture, as
// two separate, auditable steps (see the round-5 report).
const PORT = 3108;

export default defineConfig({
  testDir: "./tests/visual",
  testMatch: /pha3-v2-capture-round5\.spec\.ts/,
  timeout: 30_000,
  snapshotPathTemplate: ".webby/qa/pha3-v2/round-5/master/{arg}{ext}",
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
