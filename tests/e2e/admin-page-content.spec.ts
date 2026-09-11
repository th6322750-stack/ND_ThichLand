import { expect, test } from "playwright/test";
import { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } from "./testCredentials";

test("admin edits the About and Contact pages through matching CMS screens", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(TEST_ADMIN_EMAIL);
  await page.getByLabel(/mật khẩu/i).fill(TEST_ADMIN_PASSWORD);
  await page.getByRole("button", { name: /đăng nhập/i }).click();
  await page.waitForURL("**/admin");

  await page.goto("/admin/gioi-thieu");
  await expect(page.getByRole("heading", { name: "Chỉnh sửa trang Về chúng tôi" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Trang Về chúng tôi" }).first()).toBeVisible();
  await page.getByLabel("Tiêu đề chính").fill("Giới thiệu từ màn quản trị");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await expect(page.getByText("Đã lưu và cập nhật trang Về chúng tôi.")).toBeVisible();
  await page.goto("/gioi-thieu");
  await expect(page.getByRole("heading", { level: 1, name: "Giới thiệu từ màn quản trị" })).toBeVisible();

  await page.goto("/admin/lien-he");
  await expect(page.getByRole("heading", { name: "Chỉnh sửa trang Liên hệ" })).toBeVisible();
  await page.getByLabel("Tiêu đề chính").fill("Liên hệ trực tiếp NDTHICH");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await expect(page.getByText("Đã lưu và cập nhật trang Liên hệ.")).toBeVisible();
  await page.goto("/lien-he");
  await expect(page.getByRole("heading", { level: 1, name: "Liên hệ trực tiếp NDTHICH" })).toBeVisible();
});
