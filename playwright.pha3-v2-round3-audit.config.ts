import { defineConfig } from "playwright/test";

// PHA3 round 4 — evidence provenance audit. Re-captures the exact same 10
// screens from a clean checkout of the reviewed commit (a20313b), writing
// ONLY to .webby/qa/pha3-v2/round-3-audit/ — the committed round-3/ evidence
// tree is never touched by this run. Purpose: prove (or disprove) that the
// committed round-3 "actual" screenshots really came from this commit's
// source, via SHA256 comparison done after this capture completes.
const PORT = 3106;

export default defineConfig({
  testDir: "./tests/visual",
  testMatch: /pha3-v2-capture-round3-audit\.spec\.ts/,
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
