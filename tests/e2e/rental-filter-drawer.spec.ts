import { test, expect } from "playwright/test";

// MOCK/LOCAL UX E2E (Task 14.1, class A) — run via `npm run test:e2e:mock`.
// Needs the lib/data/properties.ts fixture set (12 listings, incl. 2 "Xưởng"
// rows) that playwright.mock.config.ts's `next dev` webServer serves in
// provider mode "mock". Against a fail-closed production server (no
// config) the "Loại BĐS" select has zero options and this whole file
// cannot run — that state is asserted instead in
// tests/e2e-failclosed/production-fail-closed.spec.ts.
test.use({ viewport: { width: 390, height: 900 } });

test.describe("mobile FilterDrawer draft-apply semantics", () => {
  test("Escape discards the draft — committed results/URL unchanged", async ({ page }) => {
    await page.goto("/cho-thue");
    const before = page.url();
    await page.getByRole("button", { name: /Bộ lọc/ }).click();
    await page.getByRole("dialog").getByLabel("Loại BĐS").selectOption("Xưởng");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(page.url()).toBe(before);
    await expect(page.getByText(/12 kết quả/)).toBeVisible();
  });

  test("X button discards the draft — committed results/URL unchanged", async ({ page }) => {
    await page.goto("/cho-thue");
    const before = page.url();
    await page.getByRole("button", { name: /Bộ lọc/ }).click();
    await page.getByRole("dialog").getByLabel("Loại BĐS").selectOption("Xưởng");
    await page.getByRole("button", { name: "Đóng bộ lọc" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(page.url()).toBe(before);
    await expect(page.getByText(/12 kết quả/)).toBeVisible();
  });

  test("backdrop click discards the draft — committed results/URL unchanged", async ({ page }) => {
    await page.goto("/cho-thue");
    const before = page.url();
    await page.getByRole("button", { name: /Bộ lọc/ }).click();
    await page.getByRole("dialog").getByLabel("Loại BĐS").selectOption("Xưởng");
    // Scoped to the drawer's own backdrop, not the generic [aria-hidden="true"]
    // selector — `next dev` also renders its floating devtools indicator with
    // aria-hidden="true", which made this ambiguous once local QA started
    // running against `next dev` instead of `next start` (GĐ6 QA reopen,
    // defect 03 requires NODE_ENV=development for mock/fixture data locally).
    await page.locator(".z-sheet-backdrop").click({ position: { x: 5, y: 5 } });
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(page.url()).toBe(before);
    await expect(page.getByText(/12 kết quả/)).toBeVisible();
  });

  test("Áp dụng commits the draft — results/URL update and drawer closes", async ({ page }) => {
    await page.goto("/cho-thue");
    await page.getByRole("button", { name: /Bộ lọc/ }).click();
    await page.getByRole("dialog").getByLabel("Loại BĐS").selectOption("Xưởng");
    await page.getByRole("button", { name: "Áp dụng" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/type=X/);
    await expect(page.getByText(/2 kết quả/)).toBeVisible();
  });

  test("reopening after a discard starts from the last committed filters, not the discarded draft", async ({ page }) => {
    await page.goto("/cho-thue");
    await page.getByRole("button", { name: /Bộ lọc/ }).click();
    await page.getByRole("dialog").getByLabel("Loại BĐS").selectOption("Xưởng");
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: /Bộ lọc/ }).click();
    await expect(page.getByRole("dialog").getByLabel("Loại BĐS")).toHaveValue("");
  });
});
