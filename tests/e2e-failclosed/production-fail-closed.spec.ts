import { test, expect } from "playwright/test";

// PRODUCTION FAIL-CLOSED E2E (Task 14.1, class B) — run via
// `npm run test:e2e:failclosed`. This suite runs against a real `next
// start` production build (playwright.failclosed.config.ts's webServer)
// with every Google/admin secret explicitly blanked, proving the browser
// never sees GĐ4/GĐ5 fixture content presented as real, and no mutation
// (contact submit, CMS write) ever reports a fake success. See
// lib/server/providerMode.ts and tests/unit/server/productionWithoutConfig.test.ts
// for the underlying contract this suite verifies end-to-end.

test.describe("production without configuration — public reads stay empty", () => {
  test("rental listing page shows no GĐ4/GĐ5 fixture properties", async ({ page }) => {
    await page.goto("/cho-thue");
    // The empty-state title renders 3 times on this page (mobile
    // composition, desktop composition, Filter aside) — only one or two are
    // actually visible at once depending on viewport (the others are
    // `desktop:hidden`/`hidden desktop:block`), so filter to whichever
    // instance is currently on-screen rather than relying on DOM order.
    await expect(page.locator("p:visible", { hasText: "Không tìm thấy căn phù hợp?" })).not.toHaveCount(0);
    // A known fixture listing must not be reachable as a "real" record.
    await page.goto("/cho-thue/can-ho-2pn-noi-that-day-du-p301");
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  });

  test("project page shows no demo project content", async ({ page }) => {
    await page.goto("/du-an");
    // An empty tabpanel <div> renders with zero height (no content, no
    // min-height) — Playwright correctly reports that as not "visible", so
    // assert on the always-rendered heading instead of the panel itself.
    // PHA2 client-approved-v2 h1 text: "Các dự án tiêu biểu" (was "Dự án của NDTHICH").
    await expect(page.getByRole("heading", { name: "Các dự án tiêu biểu" })).toBeVisible();
    await expect(page.getByText("Sun Galaxy Complex")).toHaveCount(0);
    await expect(page.getByText("Riverside Garden")).toHaveCount(0);
    await expect(page.locator("#du-an-tabpanel a")).toHaveCount(0);
  });

  test("news page shows no demo news content", async ({ page }) => {
    await page.goto("/tin-tuc");
    await expect(page.getByText("Không tìm thấy bài viết phù hợp?")).toBeVisible();
    await expect(page.getByText("Kinh nghiệm thuê nhà phù hợp ngân sách")).toHaveCount(0);
  });
});

test.describe("production without configuration — mutations never fake success", () => {
  test("contact form reports failure, not a durable success", async ({ page }) => {
    await page.goto("/lien-he");
    await page.getByLabel("Họ và tên", { exact: false }).first().fill("QA Fail-Closed");
    await page.getByLabel("Số điện thoại", { exact: false }).first().fill("0900000000");
    await page.getByRole("button", { name: "Gửi yêu cầu" }).first().click();

    // Next.js's own route announcer (#__next-route-announcer__) also uses
    // role="alert", so scope to the form's own error paragraph.
    await expect(page.locator('p[role="alert"]')).toHaveText("Không gửi được yêu cầu. Vui lòng thử lại sau.");
    await expect(page.getByRole("status")).toHaveCount(0);
    await expect(page.getByText("Đã gửi yêu cầu tư vấn")).toHaveCount(0);
  });

  test("admin CMS is unreachable and login refuses safely without configuration", async ({
    page,
    context,
  }) => {
    await context.clearCookies();

    await page.goto("/admin/bds");
    await expect(page).toHaveURL(/\/admin\/login$/);

    // Media/CMS mutation UI is behind this same gate — if login itself
    // cannot succeed, no upload/save/delete action can ever be reached to
    // fake a success either.
    await page.getByLabel(/email/i).fill("admin@ndthich.vn");
    await page.getByLabel(/mật khẩu/i).fill("anything");
    await page.getByRole("button", { name: /đăng nhập/i }).click();

    await expect(page.getByText("Máy chủ chưa được cấu hình đăng nhập. Vui lòng liên hệ quản trị viên.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);

    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "ndthich_admin_session")).toBeUndefined();
  });
});
