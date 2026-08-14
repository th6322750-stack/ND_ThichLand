#!/usr/bin/env node
// Guard for `npm run test:e2e:live` (Task 14.6). Live integration E2E must
// never run against a partially-configured environment — that could either
// silently skip real assertions or exercise an inconsistent mix of live and
// mock behavior. Runs before `next build`/Playwright are even invoked and
// exits non-zero with LIVE_E2E_SECRETS_MISSING if any required secret is
// absent. Never prints a secret's value — only which names are missing.
const REQUIRED_LIVE_ENV_VARS = [
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
  "GOOGLE_CMS_SPREADSHEET_ID",
  "GOOGLE_MEDIA_FOLDER_ID",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD_HASH",
  "AUTH_SECRET",
];

const missing = REQUIRED_LIVE_ENV_VARS.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error("LIVE_E2E_SECRETS_MISSING");
  console.error(`Missing: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("All required live E2E secrets are present.");
