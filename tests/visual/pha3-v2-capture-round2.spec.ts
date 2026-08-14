import { test, expect } from "playwright/test";
import pixelmatch from "pixelmatch";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

/**
 * PHA3 ChatGPT visual QA — round 2 structural correction (Section 9).
 *
 * Identical canonical capture mechanics to round 1
 * (tests/visual/pha3-v2-capture.spec.ts): exact viewport CSS + DSF,
 * fullPage:false, dimensions asserted, same threshold/maxDiffPixelRatio.
 * Output goes to .webby/qa/pha3-v2/round-2/ — round 1's evidence tree is
 * never touched. Each report row also carries the matching round-1
 * diffPixelRatio (read from the already-committed round-1/report.json) so
 * improvement is directly comparable, per Section 9's requirement.
 */

const ROUND1_REPORT = path.resolve(__dirname, "../../.webby/qa/pha3-v2/round-1/report.json");
const OUT_DIR = path.resolve(__dirname, "../../.webby/qa/pha3-v2/round-2");
const MASTER_DIR = path.join(OUT_DIR, "master");
const ACTUAL_DIR = path.join(OUT_DIR, "actual");
const DIFF_DIR = path.join(OUT_DIR, "diff");
const OVERLAY_DIR = path.join(OUT_DIR, "overlay");

const PIXELMATCH_THRESHOLD = 0.12;
const MAX_DIFF_PIXEL_RATIO = 0.005;

for (const dir of [ACTUAL_DIR, DIFF_DIR, OVERLAY_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

const round1Report: { route: string; viewport: string; diffPixelRatio: number | null }[] = JSON.parse(
  fs.readFileSync(ROUND1_REPORT, "utf-8"),
);
function round1RatioFor(route: string, viewport: string): number | null {
  return round1Report.find((r) => r.route === route && r.viewport === viewport)?.diffPixelRatio ?? null;
}

interface CaptureSpec {
  key: string;
  route: string;
  navigateTo: string;
}

const CAPTURES: CaptureSpec[] = [
  { key: "01-trangchu", route: "/", navigateTo: "/" },
  { key: "02-chothue", route: "/cho-thue", navigateTo: "/cho-thue" },
  { key: "03-chitietbds", route: "/cho-thue/[slug]", navigateTo: "/cho-thue/can-ho-sunrise-city-view" },
  { key: "04-duan", route: "/du-an", navigateTo: "/du-an" },
  { key: "05-chitietduan", route: "/du-an/[slug]", navigateTo: "/du-an/sun-galaxy-complex" },
];

const VIEWPORTS = {
  WEB: { cssWidth: 935, cssHeight: 1683, deviceScaleFactor: 1, expectedWidth: 935, expectedHeight: 1683 },
  MOBILE: { cssWidth: 362, cssHeight: 1086, deviceScaleFactor: 2, expectedWidth: 724, expectedHeight: 2172 },
} as const;

interface ReportEntry {
  route: string;
  viewport: "WEB" | "MOBILE";
  masterDimensions: { width: number; height: number };
  actualDimensions: { width: number; height: number };
  dimensionPass: boolean;
  diffPixels: number | null;
  diffPixelRatio: number | null;
  round1DiffPixelRatio: number | null;
  absoluteImprovement: number | null;
  percentageImprovement: number | null;
  threshold: number;
  maxDiffPixelRatio: number;
  automatedPass: boolean;
  playwrightToHaveScreenshotPass: boolean;
  masterPath: string;
  actualPath: string;
  diffPath: string | null;
  overlayPath: string | null;
  note?: string;
}

const results: ReportEntry[] = [];

async function buildOverlay(masterPath: string, actualPath: string, outPath: string) {
  const [master, actual] = await Promise.all([
    sharp(masterPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(actualPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
  ]);
  const { width, height } = master.info;
  const overlay = Buffer.alloc(width * height * 4);
  for (let i = 0; i < overlay.length; i += 4) {
    overlay[i] = Math.round((master.data[i] + actual.data[i]) / 2);
    overlay[i + 1] = Math.round((master.data[i + 1] + actual.data[i + 1]) / 2);
    overlay[i + 2] = Math.round((master.data[i + 2] + actual.data[i + 2]) / 2);
    overlay[i + 3] = 255;
  }
  await sharp(overlay, { raw: { width, height, channels: 4 } }).png().toFile(outPath);
}

for (const capture of CAPTURES) {
  for (const [viewportName, vp] of Object.entries(VIEWPORTS) as [keyof typeof VIEWPORTS, (typeof VIEWPORTS)[keyof typeof VIEWPORTS]][]) {
    const name = `${viewportName.toLowerCase()}-${capture.key}`;

    test(`${viewportName} ${capture.route}`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: vp.cssWidth, height: vp.cssHeight },
        deviceScaleFactor: vp.deviceScaleFactor,
      });
      const page = await context.newPage();
      await page.goto(capture.navigateTo, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(150);

      const actualPath = path.join(ACTUAL_DIR, `${name}.png`);
      await page.screenshot({ path: actualPath, fullPage: false });

      const actualMeta = await sharp(actualPath).metadata();
      const actualDimensions = { width: actualMeta.width ?? 0, height: actualMeta.height ?? 0 };
      const dimensionPass = actualDimensions.width === vp.expectedWidth && actualDimensions.height === vp.expectedHeight;

      const masterPath = path.join(MASTER_DIR, `${name}.png`);
      const masterMeta = await sharp(masterPath).metadata();
      const masterDimensions = { width: masterMeta.width ?? 0, height: masterMeta.height ?? 0 };

      let playwrightToHaveScreenshotPass = true;
      try {
        await expect(page).toHaveScreenshot(`${name}.png`, {
          fullPage: false,
          threshold: PIXELMATCH_THRESHOLD,
          maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO,
        });
      } catch {
        playwrightToHaveScreenshotPass = false;
      }

      let diffPixels: number | null = null;
      let diffPixelRatio: number | null = null;
      let diffPath: string | null = null;
      let overlayPath: string | null = null;
      let automatedPass = false;
      let note: string | undefined;

      if (!dimensionPass) {
        note = `Captured ${actualDimensions.width}x${actualDimensions.height}, expected ${vp.expectedWidth}x${vp.expectedHeight} — dimension mismatch fails this capture outright, no pixel comparison performed.`;
      } else {
        const [masterRaw, actualRaw] = await Promise.all([
          sharp(masterPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
          sharp(actualPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
        ]);
        const { width, height } = masterRaw.info;
        const diffBuffer = Buffer.alloc(width * height * 4);
        diffPixels = pixelmatch(masterRaw.data, actualRaw.data, diffBuffer, width, height, {
          threshold: PIXELMATCH_THRESHOLD,
        });
        diffPixelRatio = diffPixels / (width * height);
        automatedPass = diffPixelRatio <= MAX_DIFF_PIXEL_RATIO;

        diffPath = path.join(DIFF_DIR, `${name}.png`);
        await sharp(diffBuffer, { raw: { width, height, channels: 4 } }).png().toFile(diffPath);

        overlayPath = path.join(OVERLAY_DIR, `${name}.png`);
        await buildOverlay(masterPath, actualPath, overlayPath);
      }

      const round1Ratio = round1RatioFor(capture.route, viewportName);
      const absoluteImprovement = diffPixelRatio !== null && round1Ratio !== null ? round1Ratio - diffPixelRatio : null;
      const percentageImprovement =
        absoluteImprovement !== null && round1Ratio !== null && round1Ratio !== 0 ? absoluteImprovement / round1Ratio : null;

      results.push({
        route: capture.route,
        viewport: viewportName,
        masterDimensions,
        actualDimensions,
        dimensionPass,
        diffPixels,
        diffPixelRatio,
        round1DiffPixelRatio: round1Ratio,
        absoluteImprovement,
        percentageImprovement,
        threshold: PIXELMATCH_THRESHOLD,
        maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO,
        automatedPass: dimensionPass && automatedPass,
        playwrightToHaveScreenshotPass,
        masterPath: path.relative(process.cwd(), masterPath),
        actualPath: path.relative(process.cwd(), actualPath),
        diffPath: diffPath ? path.relative(process.cwd(), diffPath) : null,
        overlayPath: overlayPath ? path.relative(process.cwd(), overlayPath) : null,
        note,
      });

      console.log(
        `${viewportName} ${capture.route} -> round1=${round1Ratio !== null ? (round1Ratio * 100).toFixed(3) + "%" : "n/a"} round2=${diffPixelRatio !== null ? (diffPixelRatio * 100).toFixed(3) + "%" : "n/a"} automatedPass=${dimensionPass && automatedPass}`,
      );

      await context.close();
    });
  }
}

test.afterAll(async () => {
  fs.writeFileSync(path.join(OUT_DIR, "report.json"), JSON.stringify(results, null, 2));
  console.log(`\nWrote ${results.length} results to ${path.join(OUT_DIR, "report.json")}`);
});
