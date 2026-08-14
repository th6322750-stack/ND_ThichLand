import { test } from "playwright/test";

// LIVE INTEGRATION E2E (Task 14.1, class C) — reserved for Task 13's live
// integration gate; specs are not written yet. `npm run test:e2e:live`
// cannot reach this file at all unless every required Google/admin secret
// is present — scripts/check-live-e2e-secrets.mjs runs before Playwright
// starts and exits non-zero with LIVE_E2E_SECRETS_MISSING otherwise. See
// GD6_IMPLEMENTATION_RECEIPT.json's e2eHarness record.
test.skip("live integration specs are not written yet — reserved for Task 13", () => {});
