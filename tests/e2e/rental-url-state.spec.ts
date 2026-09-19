import { test, expect } from "playwright/test";

// MOCK/LOCAL UX E2E (Task 14.1, class A) — run via `npm run test:e2e:mock`.
// Needs the lib/data/{properties,news}.ts fixture sets that
// playwright.mock.config.ts's `next dev` webServer serves in provider mode
// "mock" (result counts and filter controls below only exist with that
// data present).
//
// PHA2 client-approved-v2: the approved /cho-thue master has no free-text
// "Từ khóa" search field (only the homepage does), and "Loại bất động sản"
// is now a checkbox list, not a <select> — see components/public-v2/Filter2.
// Rewritten to exercise the real controls while testing the same
// URL-persisted-filter-state contract.
//
// PHA3 round 1: "Khoảng giá" is now a Từ/Đến slider bound to priceMin/
// priceMax (continuous values), not the old single priceRange bucket
// <select> — the legacy `price` bucket param/select no longer exists in
// this UI, so the deep-link case below uses `priceMin` instead.
test.describe("rental discovery URL state", () => {
  test("filters survive a full page reload", async ({ page }) => {
    await page.goto("/cho-thue");
    const propertyTypeGroup = page.getByRole("group", { name: "Loại bất động sản" });
    // .click() (not .check()) — a router.replace() re-fetches this
    // force-dynamic server component, so the checkbox node briefly detaches
    // and remounts; .check()'s own built-in "verify it's now checked" step
    // can race that remount. waitForURL first guarantees the navigation
    // (and the resulting re-render) has actually landed before the
    // auto-retrying toBeChecked() assertion queries the live DOM again.
    await propertyTypeGroup.getByLabel("Xưởng").click();
    await page.waitForURL("**/cho-thue?type=X%C6%B0%E1%BB%9Fng");
    await expect(propertyTypeGroup.getByLabel("Xưởng")).toBeChecked();

    await page.reload();
    await expect(page.getByRole("group", { name: "Loại bất động sản" }).getByLabel("Xưởng")).toBeChecked();
    await expect(page.getByText(/Tìm thấy.*2.*bất động sản/)).toBeVisible();
  });

  test("deep link reconstructs the exact same filtered state", async ({ page }) => {
    await page.goto("/cho-thue?type=X%C6%B0%E1%BB%9Fng&priceMin=30000000");
    await expect(page.getByRole("group", { name: "Loại bất động sản" }).getByLabel("Xưởng")).toBeChecked();
    // "6" = the index of the 30-triệu stop in Filter2's PRICE_STOPS — the
    // <select>'s DOM value is the stop index, not its label (RangeSlider2
    // is index-driven so the two overlapping handles can compare positions).
    // getByRole("combobox", ...) (not getByLabel) — RangeSlider2 also renders
    // a same-named range <input aria-label="Từ — thanh trượt">, which
    // getByLabel's substring match would also pick up.
    await expect(page.getByRole("group", { name: "Khoảng giá" }).getByRole("combobox", { name: "Từ" })).toHaveValue("6");
    await expect(page.getByText(/Tìm thấy.*2.*bất động sản/)).toBeVisible();
  });

  test("homepage search navigates and back returns to the homepage", async ({ page }) => {
    await page.goto("/");
    // HomeSearchBar2 renders a native select on MOBILE and a custom
    // combobox/listbox on WEB. The explicit role selector targets the WEB
    // trigger at Playwright's default desktop viewport.
    await page.locator('[role="combobox"][aria-label="Loại bất động sản"]:visible').click();
    await page.getByRole("option", { name: "Studio", exact: true }).click();
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
