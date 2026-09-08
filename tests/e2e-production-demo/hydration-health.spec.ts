import { expect, test, type Page } from "playwright/test";
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from "../e2e/testCredentials";

const PUBLIC_ROUTES = [
  "/",
  "/cho-thue",
  "/cho-thue/can-ho-2pn-noi-that-day-du-p301",
  "/du-an",
  "/du-an/riverside-garden",
  "/gioi-thieu",
  "/tin-tuc",
  "/tin-tuc/kinh-nghiem-thue-nha-phu-hop-ngan-sach",
  "/lien-he",
];

const ADMIN_ROUTES = [
  "/admin",
  "/admin/bds",
  "/admin/du-an",
  "/admin/tin-tuc",
  "/admin/media",
  "/admin/gioi-thieu",
  "/admin/lien-he",
  "/admin/cai-dat",
];

const HYDRATION_ERROR =
  /hydration|hydrated|server rendered html|server-rendered html|did not match|minified react error #(418|419|423|425)/i;

function collectHydrationErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if ((message.type() === "error" || message.type() === "warning") && HYDRATION_ERROR.test(message.text())) {
      errors.push(`console: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    if (HYDRATION_ERROR.test(error.message)) errors.push(`pageerror: ${error.message}`);
  });
  return errors;
}

async function visit(page: Page, route: string): Promise<void> {
  const response = await page.goto(route, { waitUntil: "load" });
  expect(response?.status(), route).toBeLessThan(400);
  await page.waitForTimeout(150);
}

for (const viewport of [
  { name: "mobile", width: 360, height: 800 },
  { name: "desktop", width: 1280, height: 900 },
]) {
  test(`public and admin pages hydrate cleanly in production on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const hydrationErrors = collectHydrationErrors(page);

    for (const route of PUBLIC_ROUTES) await visit(page, route);

    await visit(page, "/admin/login");
    await page.getByLabel(/email/i).fill(TEST_ADMIN_EMAIL);
    await page.getByLabel(/mật khẩu/i).fill(TEST_ADMIN_PASSWORD);
    await page.getByRole("button", { name: /đăng nhập/i }).click();
    await page.waitForURL("**/admin");

    for (const route of ADMIN_ROUTES) await visit(page, route);

    expect(hydrationErrors, hydrationErrors.join("\n\n")).toEqual([]);
  });
}
