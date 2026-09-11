import { expect, test } from "playwright/test";

test("header logo scrolls the current page to the top before navigating home", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/du-an");
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(8);

  const logo = page.locator('header a[href="/"]').first();
  await logo.click();

  await expect(page).toHaveURL(/\/du-an$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(8);

  await logo.click();
  await expect(page).toHaveURL(/\/$/);
});
