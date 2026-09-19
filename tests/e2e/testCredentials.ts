// Test-only admin credentials for the MOCK/LOCAL E2E harness
// (npm run test:e2e:mock). Never a real production secret — this
// password/hash pair exists solely so admin-auth.spec.ts can exercise the
// real login flow against the `next dev` server playwright.mock.config.ts's
// webServer starts. Hash generated via hashPassword() in
// lib/server/crypto/passwords.ts and verified to match TEST_ADMIN_PASSWORD.
export const TEST_ADMIN_EMAIL = "admin@ndthich.vn";
export const TEST_ADMIN_PASSWORD = "Gd6-Test-Passw0rd!";
export const TEST_ADMIN_PASSWORD_HASH =
  "scrypt:16384:8:1:2a1784af0ebb7caaadc7b97761632987:b0352ccc88ffec239a09af7c9147384268631b1b9cb3353f67faf8381fa0c422244be46d81a6eff610a71524e023e204e59b7ce2db36719d012a7fe66705e492";
export const TEST_AUTH_SECRET = "e2e-test-auth-secret";
