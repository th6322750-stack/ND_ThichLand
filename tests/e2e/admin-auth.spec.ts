import { test, expect } from "playwright/test";

// Requires the server under QA_BASE_URL to be started with:
//   ADMIN_EMAIL=admin@ndthich.vn
//   ADMIN_PASSWORD_HASH=scrypt:16384:8:1:2a1784af0ebb7caaadc7b97761632987:b0352ccc88ffec239a09af7c9147384268631b1b9cb3353f67faf8381fa0c422244be46d81a6eff610a71524e023e204e59b7ce2db36719d012a7fe66705e492
//   AUTH_SECRET=e2e-test-auth-secret
// (password: "Gd6-Test-Passw0rd!") — see scripts/gd6-hash-test-password.mjs.
const TEST_PASSWORD = "Gd6-Test-Passw0rd!";
const TEST_EMAIL = "admin@ndthich.vn";

test.describe("real admin authentication", () => {
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
