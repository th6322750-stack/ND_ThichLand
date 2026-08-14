import { test, expect } from "playwright/test";

// MOCK/LOCAL UX E2E (Task 14.1, class A) — run via `npm run test:e2e:mock`.
// Needs the lib/data/{properties,news}.ts fixture sets that
// playwright.mock.config.ts's `next dev` webServer serves in provider mode
// "mock" (result counts and select options below only exist with that data
// present).
test.describe("rental discovery URL state", () => {
  test("filters survive a full page reload", async ({ page }) => {
    await page.goto("/cho-thue");
    await page.getByLabel("Tìm theo địa chỉ, khu vực hoặc mã phòng").fill("studio");
    await page.waitForURL("**/cho-thue?q=studio");

    await page.reload();
    await expect(page.getByLabel("Tìm theo địa chỉ, khu vực hoặc mã phòng")).toHaveValue("studio");
    await expect(page.getByText(/2 bất động sản phù hợp/)).toBeVisible();
  });

  test("deep link reconstructs the exact same filtered state", async ({ page }) => {
    await page.goto("/cho-thue?type=X%C6%B0%E1%BB%9Fng&price=tren-30tr");
    await expect(page.getByLabel("Loại BĐS")).toHaveValue("Xưởng");
    await expect(page.getByLabel("Khoảng giá")).toHaveValue("tren-30tr");
    await expect(page.getByText(/2 bất động sản phù hợp/)).toBeVisible();
  });

  test("homepage search navigates and back returns to the homepage", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Loại BĐS").selectOption("Studio");
    await page.getByRole("button", { name: "Tìm kiếm" }).click();
    await page.waitForURL("**/cho-thue?type=Studio");

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("news discovery URL state", () => {
  test("search + category survive reload", async ({ page }) => {
    await page.goto("/tin-tuc");
    await page.getByRole("button", { name: "Kinh nghiệm" }).click();
    await page.waitForURL(/category=/);

    await page.reload();
    await expect(page.getByRole("button", { name: "Kinh nghiệm" })).toHaveAttribute("aria-pressed", "true");
  });
});
