import { chromium } from "playwright";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

/**
 * PHA2 client-approved-v2 visual capture + self-check tool (persistent, not
 * a temp script — Task 10/12 of .webby/client-approved-v2/CLAUDE_PHASE2_TASK.md).
 *
 * QA_PROTOCOL.md specifies canonical browser viewports (WEB 935x1683 @1x,
 * MOBILE CSS 362x1086 @2x -> 724x2172 physical) and says "capture mode:
 * viewport screenshot". Taken completely literally that would crop every
 * capture to the master's fixed canvas height — but every master PNG shows
 * a full page (header through footer) compressed into that same canvas, the
 * same "design-export canvas size, not a literal 1:1 browser viewport"
 * pattern already seen in the GD6 Revision 3 masters. This tool therefore
 * captures at the specified WIDTH and deviceScaleFactor but full page height
 * (real scrollable content), so the whole implemented page is comparable to
 * the whole master image section-by-section. Documented as an interpretation
 * call in PHA2_IMPLEMENTATION_RECEIPT.json, not hidden.
 */

const BASE_URL = process.env.QA_BASE_URL ?? "http://localhost:3100";
const MASTERS_DIR = path.resolve(__dirname, "../../.webby/client-approved-v2/masters");
const OUT_DIR = path.resolve(__dirname, "../../.webby/qa/pha2-v2");
const BROWSER_DIR = path.join(OUT_DIR, "browser");
const DIFF_DIR = path.join(OUT_DIR, "diff");

const WEB_CSS_WIDTH = 935;
const WEB_DSF = 1;
const MOBILE_CSS_WIDTH = 362;
const MOBILE_DSF = 2;
const CHANNEL_DIFF_THRESHOLD = 32;

fs.mkdirSync(path.join(BROWSER_DIR, "WEB"), { recursive: true });
fs.mkdirSync(path.join(BROWSER_DIR, "MOBILE"), { recursive: true });
fs.mkdirSync(DIFF_DIR, { recursive: true });

interface Capture {
  name: string;
  route: string;
  viewport: "WEB" | "MOBILE";
  master: string;
}

const CAPTURES: Capture[] = [
  { name: "01_TrangChu", route: "/", viewport: "WEB", master: "WEB/01_TrangChu_WEB.png" },
  { name: "01_TrangChu", route: "/", viewport: "MOBILE", master: "MOBILE/01_TrangChu_MOBILE.png" },
  { name: "02_ChoThue", route: "/cho-thue", viewport: "WEB", master: "WEB/02_ChoThue_WEB.png" },
  { name: "02_ChoThue", route: "/cho-thue", viewport: "MOBILE", master: "MOBILE/02_ChoThue_MOBILE.png" },
  {
    name: "03_ChiTietBDS",
    route: "/cho-thue/can-ho-sunrise-city-view",
    viewport: "WEB",
    master: "WEB/03_ChiTietBDS_WEB.png",
  },
  {
    name: "03_ChiTietBDS",
    route: "/cho-thue/can-ho-sunrise-city-view",
    viewport: "MOBILE",
    master: "MOBILE/03_ChiTietBDS_MOBILE.png",
  },
  { name: "04_DuAn", route: "/du-an", viewport: "WEB", master: "WEB/04_DuAn_WEB.png" },
  { name: "04_DuAn", route: "/du-an", viewport: "MOBILE", master: "MOBILE/04_DuAn_MOBILE.png" },
  {
    name: "05_ChiTietDuAn",
    route: "/du-an/sun-galaxy-complex",
    viewport: "WEB",
    master: "WEB/05_ChiTietDuAn_WEB.png",
  },
  {
    name: "05_ChiTietDuAn",
    route: "/du-an/sun-galaxy-complex",
    viewport: "MOBILE",
    master: "MOBILE/05_ChiTietDuAn_MOBILE.png",
  },
];

interface DiffResult {
  name: string;
  viewport: string;
  route: string;
  capturedPng: string;
  masterPng: string;
  diffPng: string;
  masterDims: { width: number; height: number };
  capturedDims: { width: number; height: number };
  comparedHeight: number;
  diffPixels: number;
  totalComparedPixels: number;
  diffPercent: number;
}

async function diffOne(item: Capture, capturedPath: string): Promise<DiffResult> {
  const masterPath = path.join(MASTERS_DIR, item.master);
  const [master, captured] = await Promise.all([
    sharp(masterPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(capturedPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
  ]);

  const comparedWidth = Math.min(master.info.width, captured.info.width);
  const comparedHeight = Math.min(master.info.height, captured.info.height);
  const diffBuffer = Buffer.alloc(comparedWidth * comparedHeight * 4);
  let diffPixels = 0;

  for (let y = 0; y < comparedHeight; y++) {
    for (let x = 0; x < comparedWidth; x++) {
      const mIdx = (y * master.info.width + x) * 4;
      const cIdx = (y * captured.info.width + x) * 4;
      const outIdx = (y * comparedWidth + x) * 4;
      const dr = Math.abs(master.data[mIdx] - captured.data[cIdx]);
      const dg = Math.abs(master.data[mIdx + 1] - captured.data[cIdx + 1]);
      const db = Math.abs(master.data[mIdx + 2] - captured.data[cIdx + 2]);
      const isDiff = dr > CHANNEL_DIFF_THRESHOLD || dg > CHANNEL_DIFF_THRESHOLD || db > CHANNEL_DIFF_THRESHOLD;
      if (isDiff) {
        diffPixels++;
        diffBuffer[outIdx] = 255;
        diffBuffer[outIdx + 1] = 0;
        diffBuffer[outIdx + 2] = 0;
        diffBuffer[outIdx + 3] = 255;
      } else {
        const gray = Math.round((master.data[mIdx] + master.data[mIdx + 1] + master.data[mIdx + 2]) / 3);
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
  const diffName = `${item.viewport}-${item.name}.png`;
  const diffPath = path.join(DIFF_DIR, diffName);
  await sharp(diffBuffer, { raw: { width: comparedWidth, height: comparedHeight, channels: 4 } }).png().toFile(diffPath);

  return {
    name: item.name,
    viewport: item.viewport,
    route: item.route,
    capturedPng: path.relative(process.cwd(), capturedPath),
    masterPng: item.master,
    diffPng: path.relative(process.cwd(), diffPath),
    masterDims: { width: master.info.width, height: master.info.height },
    capturedDims: { width: captured.info.width, height: captured.info.height },
    comparedHeight,
    diffPixels,
    totalComparedPixels,
    diffPercent,
  };
}

async function main() {
  const browser = await chromium.launch();
  const results: DiffResult[] = [];

  for (const item of CAPTURES) {
    const cssWidth = item.viewport === "WEB" ? WEB_CSS_WIDTH : MOBILE_CSS_WIDTH;
    const dsf = item.viewport === "WEB" ? WEB_DSF : MOBILE_DSF;
    const context = await browser.newContext({ viewport: { width: cssWidth, height: 1000 }, deviceScaleFactor: dsf });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}${item.route}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    const outPath = path.join(BROWSER_DIR, item.viewport, `${item.name}_${item.viewport}.png`);
    await page.screenshot({ path: outPath, fullPage: true });
    const result = await diffOne(item, outPath);
    results.push(result);
    console.log(
      `${result.viewport} ${result.route} -> diff ${result.diffPercent.toFixed(2)}% master=${result.masterDims.width}x${result.masterDims.height} captured=${result.capturedDims.width}x${result.capturedDims.height}`,
    );
    await context.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT_DIR, "report.json"), JSON.stringify(results, null, 2));
  console.log(`\nWrote ${results.length} results to ${path.join(OUT_DIR, "report.json")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
