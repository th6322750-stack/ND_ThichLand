import { defineConfig } from "playwright/test";

// PHA3 ChatGPT visual QA — round 4 evidence integrity + visual convergence.
// Same canonical capture mechanics as rounds 1-3: exact viewport CSS + DSF,
// fullPage:false, dimensions asserted. Output goes to a separate
// .webby/qa/pha3-v2/round-4/ evidence tree — earlier rounds' evidence is
// never touched. Master bytes under round-4/master/ are the same
// immutable, byte-identical copies used in every prior round.
//
// Unlike round 3, this config's webServer does NOT run its own build —
// round 3's evidence was accidentally captured against a stale .next build
// (see round-4 report section 1), so round 4's process is: `npm run build`
// explicitly, THEN this capture, as two separate, auditable steps.
const PORT = 3107;

export default defineConfig({
  testDir: "./tests/visual",
  testMatch: /pha3-v2-capture-round4\.spec\.ts/,
  timeout: 30_000,
  snapshotPathTemplate: ".webby/qa/pha3-v2/round-4/master/{arg}{ext}",
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
