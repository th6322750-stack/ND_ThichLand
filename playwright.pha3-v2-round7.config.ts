import { defineConfig } from "playwright/test";

// PHA3 ChatGPT visual QA — round 7, direct visual convergence. Same
// canonical capture mechanics as rounds 1-6. This config's webServer does
// NOT run its own build — round 7's process is: `npm run build` explicitly,
// THEN this capture, as two separate, auditable steps (see the round-7
// report).
const PORT = 3110;

export default defineConfig({
  testDir: "./tests/visual",
  testMatch: /pha3-v2-capture-round7\.spec\.ts/,
  timeout: 30_000,
  snapshotPathTemplate: ".webby/qa/pha3-v2/round-7/master/{arg}{ext}",
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
