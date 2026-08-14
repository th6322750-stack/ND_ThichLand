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
    await page.goto("/cho-thue?type=X%C6%B0%E1%BB%9Fng&price=tren-30tr");
    await expect(page.getByRole("group", { name: "Loại bất động sản" }).getByLabel("Xưởng")).toBeChecked();
    await expect(page.getByLabel("Khoảng giá")).toHaveValue("tren-30tr");
    await expect(page.getByText(/Tìm thấy.*2.*bất động sản/)).toBeVisible();
  });

  test("homepage search navigates and back returns to the homepage", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Loại bất động sản").selectOption("Studio");
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
