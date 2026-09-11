import { test, expect } from "playwright/test";

// MOCK/LOCAL UX E2E — run via `npm run test:e2e:mock`, against the
// lib/data/{properties,projects}.ts fixture sets served in provider mode
// "mock".
//
// Covers the controls that used to be decorative: the rental sort select,
// the "Số phòng ngủ" group (previously wired to local state and filtering
// nothing), the browser-local "Yêu thích" list, and the /du-an filters that
// used to live in useState and vanish on reload.

test.describe("rental sort", () => {
  test("sorting is applied, written to the URL, and survives a reload", async ({ page }) => {
    await page.goto("/cho-thue");

    // First link inside a result row is the title link.
    const firstRowTitle = page.locator('[data-qa-region="list"] a[href^="/cho-thue/"]').first();
    await expect(firstRowTitle).toBeVisible();

    await page.locator("select:visible").filter({ hasText: "Giá thấp" }).selectOption("price-asc");
    await page.waitForURL("**/cho-thue?sort=price-asc");

    // Cheapest fixture listing (5.500.000đ) must now lead the list.
    await expect(page.locator('[data-qa-region="list"] a[href^="/cho-thue/"]').first()).toHaveText("P.205 - Tòa B");

    await page.reload();
    await expect(page.locator("select:visible").filter({ hasText: "Giá thấp" })).toHaveValue("price-asc");
  });

  test("an unknown sort value in the URL degrades to the default instead of breaking the page", async ({ page }) => {
    await page.goto("/cho-thue?sort=khong-ton-tai");
    await expect(page.locator("select:visible").filter({ hasText: "Giá thấp" })).toHaveValue("default");
    await expect(page.getByText(/Tìm thấy.*bất động sản/)).toBeVisible();
  });
});

test.describe("bedroom filter", () => {
  test("filters results and is reflected in the URL", async ({ page }) => {
    await page.goto("/cho-thue");
    const group = page.getByRole("group", { name: "Số phòng ngủ" });

    await group.getByLabel("2 phòng").click();
    await page.waitForURL("**/cho-thue?pn=2");

    // The GĐ4/GĐ5 fixture listings all carry bedroomCount: null, and an
    // unknown count is deliberately NOT treated as a match — so this is the
    // honest empty state, not a silent no-op like the old fake control.
    await expect(page.locator("p:visible", { hasText: "Không tìm thấy căn phù hợp?" })).not.toHaveCount(0);

    await page.reload();
    await expect(page.getByRole("group", { name: "Số phòng ngủ" }).getByLabel("2 phòng")).toBeChecked();
  });
});

test.describe("saved listings", () => {
  test("saving a listing persists across reload and drives the Yêu thích view", async ({ page }) => {
    await page.goto("/cho-thue");

    const firstHeart = page.getByRole("button", { name: "Lưu vào danh sách yêu thích" }).first();
    await firstHeart.click();
    await expect(page.getByRole("button", { name: "Bỏ khỏi danh sách yêu thích" }).first()).toBeVisible();

    await page.reload();
    await expect(page.getByRole("button", { name: "Bỏ khỏi danh sách yêu thích" }).first()).toBeVisible();

    await page.goto("/cho-thue?luu=1");
    await expect(page.getByText(/Đang xem: đã lưu \(1\)/)).toBeVisible();
    await expect(page.locator('[data-qa-region="list"] a[href^="/cho-thue/"]').first()).toBeVisible();
  });

  test("the saved view stays active while other filters change", async ({ page }) => {
    await page.goto("/cho-thue");
    await page.getByRole("button", { name: "Lưu vào danh sách yêu thích" }).first().click();

    await page.goto("/cho-thue?luu=1");
    await page.getByRole("group", { name: "Loại bất động sản" }).getByLabel("Căn hộ chung cư").click();

    // Regression guard: useRentalFilters used to rebuild the query string
    // from filter state alone and silently drop ?luu=1.
    await page.waitForURL(/luu=1/);
    await expect(page.getByText(/Đang xem: đã lưu/)).toBeVisible();
  });

  test("the empty saved view explains itself instead of blaming the filters", async ({ page }) => {
    await page.goto("/cho-thue?luu=1");
    await expect(page.getByText("Chưa có BĐS nào được lưu")).toBeVisible();
  });
});

test.describe("project discovery URL state", () => {
  test("keyword, khu vực and trạng thái survive a reload and a deep link", async ({ page }) => {
    await page.goto("/du-an");

    await page.getByRole("tab", { name: "Đã hoàn thành" }).click();
    await page.waitForURL(/tt=/);
    await page.reload();
    await expect(page.getByRole("tab", { name: "Đã hoàn thành" })).toHaveAttribute("aria-selected", "true");

    // "riverside" matches Riverside Garden and Capital Riverside — 2 of the
    // 6 fixture projects, so the keyword genuinely narrows the list.
    await page.goto("/du-an?q=riverside");
    await expect(page.getByLabel("Tìm theo tên dự án, chủ đầu tư hoặc khu vực")).toHaveValue("riverside");
    await expect(page.locator("#du-an-tabpanel a")).toHaveCount(2);
  });

  test("an unknown status param falls back to Tất cả rather than an empty list", async ({ page }) => {
    await page.goto("/du-an?tt=Khong%20Ton%20Tai");
    await expect(page.getByRole("tab", { name: "Tất cả" })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#du-an-tabpanel a").first()).toBeVisible();
  });

  test("every project is reachable on a phone viewport", async ({ page }) => {
    // Cards past the 4th used to be hidden below 900px with no pagination to
    // reach them, so a phone visitor simply could not see them.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/du-an");
    await expect(page.locator("#du-an-tabpanel a")).toHaveCount(6);
    await expect(page.locator("#du-an-tabpanel a").nth(5)).toBeVisible();
  });
});
