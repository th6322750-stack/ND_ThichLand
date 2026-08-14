import { test, expect } from "playwright/test";
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from "./testCredentials";

// MOCK/LOCAL UX E2E (Task 14.1, class A) — run via `npm run test:e2e:mock`.
// playwright.mock.config.ts's webServer starts `next dev` with
// TEST_ADMIN_EMAIL/TEST_ADMIN_PASSWORD_HASH/TEST_AUTH_SECRET
// (tests/e2e/testCredentials.ts) already wired into its env, so the real
// login flow below is exercised end-to-end without any live secret.
const TEST_PASSWORD = TEST_ADMIN_PASSWORD;
const TEST_EMAIL = TEST_ADMIN_EMAIL;

test.describe("real admin authentication", () => {
  // Task 14.4 — deterministic auth isolation: Playwright already gives each
  // test its own BrowserContext (a fresh cookie jar) by default, but this
  // makes that guarantee explicit rather than implicit, so a future change
  // to shared context/storageState can't silently leak a session between
  // these tests.
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("unauthenticated access to a protected page redirects to login", async ({ page }) => {
    await page.goto("/admin/bds");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("wrong password shows a generic error and does not redirect", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/mật khẩu/i).fill("totally-wrong-password");
    await page.getByRole("button", { name: /đăng nhập/i }).click();
    await expect(page.getByText("Email hoặc mật khẩu không đúng.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("correct credentials log in, reach /admin, and survive a hard reload", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/mật khẩu/i).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /đăng nhập/i }).click();
    await page.waitForURL("**/admin");

    // hard navigation, not client router — proves the session is real (cookie), not client state
    await page.goto("/admin/bds");
    await expect(page).toHaveURL(/\/admin\/bds$/);

    await page.reload();
    await expect(page).toHaveURL(/\/admin\/bds$/);
  });

  test("session cookie is HttpOnly and not readable from document.cookie", async ({ page, context }) => {
    await page.goto("/admin/login");
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/mật khẩu/i).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /đăng nhập/i }).click();
    await page.waitForURL("**/admin");

    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name === "ndthich_admin_session");
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie!.httpOnly).toBe(true);
    expect(sessionCookie!.sameSite).toBe("Lax");

    const visibleFromJs = await page.evaluate(() => document.cookie);
    expect(visibleFromJs).not.toContain("ndthich_admin_session");
  });

  test("logout clears the session and protected pages redirect again", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/mật khẩu/i).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /đăng nhập/i }).click();
    await page.waitForURL("**/admin");

    await page.getByRole("button", { name: "Đăng xuất" }).first().click();
    await page.waitForURL("**/admin/login");

    await page.goto("/admin/bds");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("a tampered session cookie is rejected server-side even though it's present", async ({ page, context, baseURL }) => {
    await context.addCookies([
      {
        name: "ndthich_admin_session",
        value: "tampered.notarealtoken",
        url: baseURL,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    await page.goto("/admin/bds");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("remember-me issues a session cookie with a far-future expiry", async ({ page, context }) => {
    await page.goto("/admin/login");
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/mật khẩu/i).fill(TEST_PASSWORD);
    await page.getByLabel(/ghi nhớ đăng nhập/i).check();
    await page.getByRole("button", { name: /đăng nhập/i }).click();
    await page.waitForURL("**/admin");

    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name === "ndthich_admin_session");
    const daysUntilExpiry = (sessionCookie!.expires * 1000 - Date.now()) / (24 * 60 * 60 * 1000);
    expect(daysUntilExpiry).toBeGreaterThan(20);
  });
});
