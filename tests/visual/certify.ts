import { chromium, type Page } from "playwright";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { publicCaptures, adminCaptures, type Capture } from "./manifest";

/**
 * GĐ6 Final Visual Certification — compares the CURRENT implementation
 * directly against the approved Revision 3 PNGs (Capture.approvedPng),
 * not against tests/visual/__gd6-baseline__ (a self-captured GĐ6-era
 * snapshot used for day-to-day regression, not the ground truth).
 *
 * Output: tests/visual/__certification__/{capture,diff}/*.png + report.json
 */

const BASE_URL = process.env.QA_BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.resolve(__dirname, "__certification__");
const CAPTURE_DIR = path.join(OUT_DIR, "capture");
const DIFF_DIR = path.join(OUT_DIR, "diff");

// Approved WEB/ADMIN renders are 1920px wide at 1x (matches the 1920 capture
// viewport exactly). Approved MOBILE renders are 1080px wide — 1080/390 is
// not a clean device-pixel-ratio, but it IS exactly 360 CSS px * 3x scale.
// Rather than guess which CSS width the original renders were authored at,
// this captures at the CSS width already used for every other visual check
// in this project (390 — baked into the site's own tablet:768px breakpoint
// as "everything below is mobile"), with a deviceScaleFactor chosen so the
// OUTPUT pixel width lands on 1080 exactly — matching the approved PNG's
// resolution with no post-hoc resize/interpolation on either side.
const MOBILE_CSS_WIDTH = 390;
const MOBILE_APPROVED_PX_WIDTH = 1080;
const MOBILE_SCALE = MOBILE_APPROVED_PX_WIDTH / MOBILE_CSS_WIDTH;

// A pixel counts as "different" only if some channel differs by more than
// this — filters normal font/anti-aliasing rendering noise between a design
// tool's renderer and Chromium (unavoidable even for genuinely matching
// layouts) so the percentage reflects real content/color/layout deviation.
const CHANNEL_DIFF_THRESHOLD = 32;

fs.mkdirSync(CAPTURE_DIR, { recursive: true });
fs.mkdirSync(DIFF_DIR, { recursive: true });

async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: "networkidle" });
  await page.getByLabel(/email/i).fill("admin@ndthich.vn");
  await page.getByLabel(/mật khẩu/i).fill("Gd6-Test-Passw0rd!");
  await page.getByRole("button", { name: /đăng nhập/i }).click();
  await page.waitForURL("**/admin");
}

function safeName(item: Capture): string {
  return `${item.viewport}-${item.route.replace(/\//g, "_") || "root"}.png`;
}

async function captureOne(item: Capture, page: Page): Promise<string> {
  await page.goto(`${BASE_URL}${item.navigateTo}`, { waitUntil: "networkidle" });
  // "networkidle" does not guarantee the custom local font (next/font/local,
  // display:"swap") has finished loading and swapped in — a screenshot taken
  // before that resolves silently captures the fallback font (different
  // metrics), which cascades into large, spurious height/wrapping diffs
  // across the whole page. document.fonts.ready is the actual signal.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(100);
  const name = safeName(item);
  const outPath = path.join(CAPTURE_DIR, name);
  await page.screenshot({ path: outPath, fullPage: true });
  return outPath;
}

interface DiffResult {
  name: string;
  route: string;
  viewport: string;
  approvedPng: string;
  capturedPng: string;
  diffPng: string | null;
  approvedDims: { width: number; height: number };
  capturedDims: { width: number; height: number };
  widthMatches: boolean;
  heightDeltaPx: number;
  heightDeltaPct: number;
  comparedHeight: number;
  diffPixels: number;
  totalComparedPixels: number;
  diffPercent: number;
}

async function diffOne(item: Capture, capturedPath: string): Promise<DiffResult> {
  const approvedPath = path.resolve(process.cwd(), item.approvedPng);
  const name = safeName(item);

  const [approved, captured] = await Promise.all([
    sharp(approvedPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(capturedPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
  ]);

  const widthMatches = approved.info.width === captured.info.width;
  const comparedWidth = Math.min(approved.info.width, captured.info.width);
  const comparedHeight = Math.min(approved.info.height, captured.info.height);
  const heightDeltaPx = captured.info.height - approved.info.height;
  const heightDeltaPct = (Math.abs(heightDeltaPx) / approved.info.height) * 100;

  const diffBuffer = Buffer.alloc(comparedWidth * comparedHeight * 4);
  let diffPixels = 0;

  for (let y = 0; y < comparedHeight; y++) {
    for (let x = 0; x < comparedWidth; x++) {
      const aIdx = (y * approved.info.width + x) * 4;
      const bIdx = (y * captured.info.width + x) * 4;
      const outIdx = (y * comparedWidth + x) * 4;

      // Non-null: x < comparedWidth and y < comparedHeight (the overlap of
      // both images) keep aIdx/bIdx and their +1/+2 offsets inside each
      // buffer's own width*height*4 bounds.
      const dr = Math.abs(approved.data[aIdx]! - captured.data[bIdx]!);
      const dg = Math.abs(approved.data[aIdx + 1]! - captured.data[bIdx + 1]!);
      const db = Math.abs(approved.data[aIdx + 2]! - captured.data[bIdx + 2]!);
      const isDiff = dr > CHANNEL_DIFF_THRESHOLD || dg > CHANNEL_DIFF_THRESHOLD || db > CHANNEL_DIFF_THRESHOLD;

      if (isDiff) {
        diffPixels++;
        diffBuffer[outIdx] = 255;
        diffBuffer[outIdx + 1] = 0;
        diffBuffer[outIdx + 2] = 0;
        diffBuffer[outIdx + 3] = 255;
      } else {
        // Faded grayscale of the approved pixel for spatial context.
        const gray = Math.round((approved.data[aIdx]! + approved.data[aIdx + 1]! + approved.data[aIdx + 2]!) / 3);
        const faded = Math.round(gray * 0.35 + 255 * 0.65);
        diffBuffer[outIdx] = faded;
        diffBuffer[outIdx + 1] = faded;
        diffBuffer[outIdx + 2] = faded;
        diffBuffer[outIdx + 3] = 255;
      }
    }
  }

  const totalComparedPixels = comparedWidth * comparedHeight;
  const diffPercent = (diffPixels / totalComparedPixels) * 100;

  const diffPath = path.join(DIFF_DIR, name);
  await sharp(diffBuffer, { raw: { width: comparedWidth, height: comparedHeight, channels: 4 } })
    .png()
    .toFile(diffPath);

  return {
    name,
    route: item.route,
    viewport: item.viewport,
    approvedPng: item.approvedPng,
    capturedPng: path.relative(process.cwd(), capturedPath),
    diffPng: path.relative(process.cwd(), diffPath),
    approvedDims: { width: approved.info.width, height: approved.info.height },
    capturedDims: { width: captured.info.width, height: captured.info.height },
    widthMatches,
    heightDeltaPx,
    heightDeltaPct,
    comparedHeight,
    diffPixels,
    totalComparedPixels,
    diffPercent,
  };
}

async function main() {
  const browser = await chromium.launch();
  const results: DiffResult[] = [];

  // Public WEB + MOBILE
  for (const item of publicCaptures) {
    const scale = item.viewport === "MOBILE" ? MOBILE_SCALE : 1;
    const cssWidth = item.viewport === "MOBILE" ? MOBILE_CSS_WIDTH : item.width;
    const context = await browser.newContext({
      viewport: { width: cssWidth, height: 1000 },
      deviceScaleFactor: scale,
    });
    const page = await context.newPage();
    const capturedPath = await captureOne(item, page);
    const result = await diffOne(item, capturedPath);
    results.push(result);
    console.log(`${result.viewport} ${result.route} -> diff ${result.diffPercent.toFixed(4)}% (${result.diffPixels}/${result.totalComparedPixels}px), dims approved=${result.approvedDims.width}x${result.approvedDims.height} captured=${result.capturedDims.width}x${result.capturedDims.height}`);
    await context.close();
  }

  // Admin — /admin/login captured logged-out first, then the rest logged in
  const adminContext = await browser.newContext({ viewport: { width: 1920, height: 1000 }, deviceScaleFactor: 1 });
  const loginItem = adminCaptures.find((c) => c.route === "/admin/login");
  if (loginItem) {
    const loggedOutPage = await adminContext.newPage();
    const capturedPath = await captureOne(loginItem, loggedOutPage);
    const result = await diffOne(loginItem, capturedPath);
    results.push(result);
    console.log(`${result.viewport} ${result.route} -> diff ${result.diffPercent.toFixed(4)}% (${result.diffPixels}/${result.totalComparedPixels}px), dims approved=${result.approvedDims.width}x${result.approvedDims.height} captured=${result.capturedDims.width}x${result.capturedDims.height}`);
    await loggedOutPage.close();
  }

  const adminPage = await adminContext.newPage();
  await loginAsAdmin(adminPage);
  for (const item of adminCaptures) {
    if (item.route === "/admin/login") continue;
    const capturedPath = await captureOne(item, adminPage);
    const result = await diffOne(item, capturedPath);
    results.push(result);
    console.log(`${result.viewport} ${result.route} -> diff ${result.diffPercent.toFixed(4)}% (${result.diffPixels}/${result.totalComparedPixels}px), dims approved=${result.approvedDims.width}x${result.approvedDims.height} captured=${result.capturedDims.width}x${result.capturedDims.height}`);
  }
  await adminContext.close();

  await browser.close();

  fs.writeFileSync(path.join(OUT_DIR, "report.json"), JSON.stringify(results, null, 2));
  console.log(`\nWrote ${results.length} results to ${path.join(OUT_DIR, "report.json")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
