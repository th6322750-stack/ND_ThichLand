import { expect, test } from "playwright/test";

test("mobile footer has no dead hash links and every visible link has a 44px touch target", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const footer = page.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toBeVisible();
  await expect(footer.locator('a[href="#"]')).toHaveCount(0);
  await expect(footer).toContainText("Đội 5, Ích Vịnh, Xã Đại Thanh, Thành phố Hà Nội");
  await expect(footer).toContainText("0986 602 203");
  await expect(page.getByText("0985 551 396")).toHaveCount(0);
  await expect(page.getByText(/120 Nguyễn Xí/i)).toHaveCount(0);

  const targets = await footer.locator("a").evaluateAll((links) =>
    links
      .map((link) => {
        const box = link.getBoundingClientRect();
        return { label: link.getAttribute("aria-label") || link.textContent?.trim() || link.getAttribute("href"), width: box.width, height: box.height };
      })
      .filter((target) => target.width > 0 && target.height > 0),
  );
  expect(targets.length).toBeGreaterThan(0);
  expect(targets.filter((target) => target.height < 44), JSON.stringify(targets, null, 2)).toEqual([]);
});
