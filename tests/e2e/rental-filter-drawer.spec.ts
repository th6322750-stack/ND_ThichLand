import { test, expect } from "playwright/test";

// MOCK/LOCAL UX E2E (Task 14.1, class A) — run via `npm run test:e2e:mock`.
// Needs the lib/data/properties.ts fixture set (12 listings, incl. 2 "Xưởng"
// rows) that playwright.mock.config.ts's `next dev` webServer serves in
// provider mode "mock". Against a fail-closed production server (no
// config) the "Loại bất động sản" checkboxes have no real options and this
// whole file cannot run — that state is asserted instead in
// tests/e2e-failclosed/production-fail-closed.spec.ts.
//
// PHA2 client-approved-v2: /cho-thue's filter drawer now renders "Loại bất
// động sản" as a checkbox list (matching the approved master, see
// components/public-v2/Filter2) instead of the pre-PHA2 <select> — updated
// to interact with the real controls while testing the exact same
// draft-apply behavioral contract (FilterDrawer2 reuses the same
// draft-first semantics as the pre-PHA2 FilterDrawer).
test.use({ viewport: { width: 390, height: 900 } });

test.describe("mobile FilterDrawer draft-apply semantics", () => {
  test("Escape discards the draft — committed results/URL unchanged", async ({ page }) => {
    await page.goto("/cho-thue");
    const before = page.url();
    await page.getByRole("button", { name: "Lọc" }).click();
    await page.getByRole("dialog").getByLabel("Xưởng").check();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(page.url()).toBe(before);
    await expect(page.getByText(/12 kết quả/)).toBeVisible();
  });

  test("X button discards the draft — committed results/URL unchanged", async ({ page }) => {
    await page.goto("/cho-thue");
    const before = page.url();
    await page.getByRole("button", { name: "Lọc" }).click();
    await page.getByRole("dialog").getByLabel("Xưởng").check();
    await page.getByRole("button", { name: "Đóng bộ lọc" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(page.url()).toBe(before);
    await expect(page.getByText(/12 kết quả/)).toBeVisible();
  });

  test("backdrop click discards the draft — committed results/URL unchanged", async ({ page }) => {
    await page.goto("/cho-thue");
    const before = page.url();
    await page.getByRole("button", { name: "Lọc" }).click();
    await page.getByRole("dialog").getByLabel("Xưởng").check();
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
    await page.getByRole("button", { name: "Lọc" }).click();
    await page.getByRole("dialog").getByLabel("Xưởng").check();
    await page.getByRole("button", { name: "Áp dụng bộ lọc" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/type=X/);
    await expect(page.getByText(/2 kết quả/)).toBeVisible();
  });

  test("reopening after a discard starts from the last committed filters, not the discarded draft", async ({ page }) => {
    await page.goto("/cho-thue");
    await page.getByRole("button", { name: "Lọc" }).click();
    await page.getByRole("dialog").getByLabel("Xưởng").check();
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "Lọc" }).click();
    const propertyTypeGroup = page.getByRole("dialog").getByRole("group", { name: "Loại bất động sản" });
    await expect(propertyTypeGroup.getByLabel("Tất cả")).toBeChecked();
    await expect(propertyTypeGroup.getByLabel("Xưởng")).not.toBeChecked();
  });
});
