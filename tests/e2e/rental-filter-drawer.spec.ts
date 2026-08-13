import { test, expect } from "playwright/test";

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
    await page.locator('[aria-hidden="true"]').click({ position: { x: 5, y: 5 } });
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
