import { defineConfig } from "playwright/test";
import {
  TEST_ADMIN_EMAIL,
  TEST_ADMIN_PASSWORD_HASH,
  TEST_AUTH_SECRET,
} from "./tests/e2e/testCredentials";

// Production-rendering smoke suite for the client-demo deployment. Unlike
// playwright.mock.config.ts, this starts the optimized build and therefore
// catches server/client hydration differences that development-only QA can
// misdiagnose or miss.
const PORT = 3102;

export default defineConfig({
  testDir: "./tests/e2e-production-demo",
  timeout: 45_000,
  workers: 1,
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      DEMO_MODE: "true",
      NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
      GOOGLE_SERVICE_ACCOUNT_EMAIL: "",
      GOOGLE_PRIVATE_KEY: "",
      GOOGLE_RENTAL_SPREADSHEET_ID: "",
      GOOGLE_CMS_SPREADSHEET_ID: "",
      GOOGLE_MEDIA_FOLDER_ID: "",
      ADMIN_EMAIL: TEST_ADMIN_EMAIL,
      ADMIN_PASSWORD_HASH: TEST_ADMIN_PASSWORD_HASH,
      AUTH_SECRET: `${TEST_AUTH_SECRET}-production-demo-smoke`,
      AUTH_COOKIE_INSECURE: "true",
    },
  },
});
