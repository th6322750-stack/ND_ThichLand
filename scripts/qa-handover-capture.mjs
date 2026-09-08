#!/usr/bin/env node
/**
 * Handover QA capture — screenshots every public route (auto-discovering a
 * real slug for each [slug] route rather than hardcoding one that will go
 * stale) plus every admin screen, at a mobile and a desktop viewport, into
 * one timestamped, indexed folder a reviewer (human or AI) can walk through
 * top to bottom.
 *
 * Usage:
 *   node scripts/qa-handover-capture.mjs
 *
 * Env vars (all optional):
 *   BASE_URL       Site to capture. Default: https://ndthichland.com.vn
 *   ADMIN_EMAIL    Admin login. If unset, admin screens are skipped.
 *   ADMIN_PASSWORD Admin login. If unset, admin screens are skipped.
 *   OUT_DIR        Output folder. Default: qa-handover-output/<timestamp>/
 *
 * Requires Playwright's Chromium browser:
 *   npx playwright install chromium
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = (process.env.BASE_URL ?? "https://ndthichland.com.vn").replace(/\/$/, "");
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const OUT_DIR =
  process.env.OUT_DIR ?? path.join("qa-handover-output", new Date().toISOString().replace(/[:.]/g, "-"));

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
};

// Static public routes. [slug] routes are resolved at runtime below so this
// never captures a slug that has since been deleted or renamed.
const PUBLIC_ROUTES = [
  { name: "01_TrangChu", path: "/" },
  { name: "02_ChoThue", path: "/cho-thue" },
  { name: "04_DuAn", path: "/du-an" },
  { name: "06_GioiThieu", path: "/gioi-thieu" },
  { name: "07_TinTuc", path: "/tin-tuc" },
  { name: "09_LienHe", path: "/lien-he" },
];

const ADMIN_ROUTES = [
  { name: "01_Dashboard", path: "/admin" },
  { name: "02_BDS_List", path: "/admin/bds" },
  { name: "03_BDS_New", path: "/admin/bds/new" },
  { name: "04_DuAn_List", path: "/admin/du-an" },
  { name: "05_DuAn_New", path: "/admin/du-an/new" },
  { name: "06_TinTuc_List", path: "/admin/tin-tuc" },
  { name: "07_TinTuc_New", path: "/admin/tin-tuc/new" },
  { name: "08_Media", path: "/admin/media" },
  { name: "09_CaiDat", path: "/admin/cai-dat" },
];

const manifest = [];

async function shoot(page, viewportName, folder, name, url) {
  await page.setViewportSize(VIEWPORTS[viewportName]);
  const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 }).catch(() => null);
  await page.waitForTimeout(400); // let fonts/late images settle
  const status = response?.status() ?? "no-response";
  const outPath = path.join(OUT_DIR, folder, viewportName, `${name}.png`);
  await mkdir(path.dirname(outPath), { recursive: true });
  await page.screenshot({ path: outPath, fullPage: true });
  manifest.push({ url, status, file: outPath.replace(/\\/g, "/") });
  console.log(`  [${status}] ${viewportName}/${name} <- ${url}`);
}

/** Scrapes the first "Xem chi tiết"-style detail link off a list page so the
 * [slug] routes are captured with real, currently-live content. */
async function firstDetailHref(page, listPath, hrefPrefix) {
  await page.goto(BASE_URL + listPath, { waitUntil: "networkidle", timeout: 30000 }).catch(() => null);
  const href = await page
    .locator(`a[href^="${hrefPrefix}"]`)
    .first()
    .getAttribute("href")
    .catch(() => null);
  return href;
}

async function main() {
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output:   ${OUT_DIR}\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Public routes:");
  for (const route of PUBLIC_ROUTES) {
    for (const viewport of Object.keys(VIEWPORTS)) {
      await shoot(page, viewport, "public", route.name, BASE_URL + route.path);
    }
  }

  // Detail routes — resolved to whatever is actually live right now.
  const choThueHref = await firstDetailHref(page, "/cho-thue", "/cho-thue/");
  const duAnHref = await firstDetailHref(page, "/du-an", "/du-an/");
  const tinTucHref = await firstDetailHref(page, "/tin-tuc", "/tin-tuc/");
  for (const [name, href] of [
    ["03_ChiTietChoThue", choThueHref],
    ["05_ChiTietDuAn", duAnHref],
    ["08_ChiTietTinTuc", tinTucHref],
  ]) {
    if (!href) {
      console.log(`  SKIPPED ${name} — no detail link found on its list page (empty catalogue?)`);
      continue;
    }
    for (const viewport of Object.keys(VIEWPORTS)) {
      await shoot(page, viewport, "public", name, BASE_URL + href);
    }
  }

  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    console.log("\nAdmin login:");
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto(BASE_URL + "/admin/login", { waitUntil: "networkidle" });
    await page.fill('input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    // Not a fixed delay: the redirect can take longer than any fixed
    // guess on a cold serverless instance, and a fixed wait that's too
    // short reads as "wrong password" when it's really just slow.
    await page
      .waitForURL((url) => url.pathname.startsWith("/admin") && !url.pathname.includes("/login"), {
        timeout: 10000,
      })
      .catch(() => {});
    const loggedIn = page.url().includes("/admin") && !page.url().includes("/login");
    console.log(loggedIn ? "  Logged in." : "  LOGIN FAILED — check ADMIN_EMAIL/ADMIN_PASSWORD.");

    if (loggedIn) {
      console.log("\nAdmin routes:");
      for (const route of ADMIN_ROUTES) {
        for (const viewport of Object.keys(VIEWPORTS)) {
          await shoot(page, viewport, "admin", route.name, BASE_URL + route.path);
        }
      }
    }
  } else {
    console.log("\nADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin screens (public-only run).");
  }

  await browser.close();

  const manifestPath = path.join(OUT_DIR, "manifest.json");
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`\nDone. ${manifest.length} screenshots. Manifest: ${manifestPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
