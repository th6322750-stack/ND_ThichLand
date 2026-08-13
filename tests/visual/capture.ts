import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { publicCaptures, adminCaptures, type Capture } from "./manifest";

const BASE_URL = process.env.QA_BASE_URL ?? "http://localhost:3001";
const OUT_DIR = path.resolve(__dirname, "__screenshots__");

async function loginAsAdmin(page: import("playwright").Page) {
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: "networkidle" });
  await page.getByLabel(/email/i).fill("admin@ndthich.vn");
  await page.getByLabel(/mật khẩu/i).fill("qa-password");
  await page.getByRole("button", { name: /đăng nhập/i }).click();
  await page.waitForURL("**/admin");
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  const context = await browser.newContext();
  const adminPage = await context.newPage();
  await loginAsAdmin(adminPage);

  async function capture(item: Capture, page: import("playwright").Page) {
    await page.setViewportSize({ width: item.width, height: 1000 });
    await page.goto(`${BASE_URL}${item.navigateTo}`, { waitUntil: "networkidle" });
    const safeName = `${item.viewport}-${item.route.replace(/\//g, "_") || "root"}.png`;
    await page.screenshot({ path: path.join(OUT_DIR, safeName), fullPage: true });
    console.log(`captured ${item.route} [${item.viewport}] -> ${safeName}`);
  }

  for (const item of publicCaptures) {
    const page = await context.newPage();
    await capture(item, page);
    await page.close();
  }

  for (const item of adminCaptures) {
    await capture(item, adminPage);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
