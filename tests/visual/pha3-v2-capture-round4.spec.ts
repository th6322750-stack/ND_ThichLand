import { test, expect } from "playwright/test";
import pixelmatch from "pixelmatch";
import sharp from "sharp";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/**
 * PHA3 ChatGPT visual QA — round 4 evidence integrity + visual convergence.
 *
 * Same canonical capture mechanics as rounds 1-3. New in round 4 (section 1):
 * every report entry also carries evidence-provenance metadata
 * (implementationCommit, captureSourceCommit, gitStatus before/after,
 * browserVersion, renderMode, screenshotSha256) so a later audit can
 * verify these screenshots really came from the commit they claim to.
 *
 * Baseline (section 2): round 4 compares against ROUND3_TRUE_BASELINE, a
 * SOURCE-VERIFIED re-measurement of round 3 (from .webby/qa/pha3-v2/
 * round-3-audit/, captured from a clean a20313b checkout + fresh build —
 * see the round-4 report's evidence-provenance section for why the
 * originally-committed round-3/report.json numbers were stale and are not
 * used here), NOT the committed round-3 report.json numbers directly.
 */

const ROUND3_TRUE_BASELINE: Record<string, Record<string, number>> = {
  "/": { WEB: 0.49554, MOBILE: 0.48895 },
  "/cho-thue": { WEB: 0.38475, MOBILE: 0.55692 },
  "/cho-thue/[slug]": { WEB: 0.33414, MOBILE: 0.33249 },
  "/du-an": { WEB: 0.55935, MOBILE: 0.69614 },
  "/du-an/[slug]": { WEB: 0.48452, MOBILE: 0.43601 },
};

const OUT_DIR = path.resolve(__dirname, "../../.webby/qa/pha3-v2/round-4");
const MASTER_DIR = path.join(OUT_DIR, "master");
const ACTUAL_DIR = path.join(OUT_DIR, "actual");
const DIFF_DIR = path.join(OUT_DIR, "diff");
const OVERLAY_DIR = path.join(OUT_DIR, "overlay");

const PIXELMATCH_THRESHOLD = 0.12;
const MAX_DIFF_PIXEL_RATIO = 0.005;

for (const dir of [ACTUAL_DIR, DIFF_DIR, OVERLAY_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

interface CaptureSpec {
  key: string;
  route: string;
  navigateTo: string;
  masterRegions: Partial<Record<"WEB" | "MOBILE", Record<string, { x: number; y: number; width: number; height: number }>>>;
}

// Per-route MOBILE header heights, measured via ruler-crop from each of the
// 5 mobile masters directly (round-4 section 3 — round 3 wrongly shared one
// height across all 5 routes). Home was measured with a fine 10px-grid
// crop (90px); the other 4 were measured with a coarser 20px-grid crop
// during route-variant analysis and are within the same +/-10px band, so
// this round applies 90 uniformly as the best available estimate rather
// than presenting false per-route precision — the STRUCTURAL variant
// (icon-only vs pill hotline, hamburger border) is what's route-specific
// and is captured correctly in Header2 itself; this number is QA
// bookkeeping only. See the round-4 report for this disclosed limitation.
const MOBILE_HEADER_HEIGHT = 90;
const SHARED_HEADER_WEB = { x: 0, y: 0, width: 935, height: 64 };
const mobileHeader = () => ({ x: 0, y: 0, width: 724, height: MOBILE_HEADER_HEIGHT });

const CAPTURES: CaptureSpec[] = [
  {
    key: "01-trangchu",
    route: "/",
    navigateTo: "/",
    masterRegions: {
      WEB: {
        header: SHARED_HEADER_WEB,
        hero: { x: 0, y: 64, width: 935, height: 281 },
        trustmetrics: { x: 0, y: 345, width: 935, height: 95 },
        search: { x: 0, y: 440, width: 935, height: 65 },
        "featured-rentals": { x: 0, y: 505, width: 935, height: 290 },
        "featured-projects": { x: 0, y: 795, width: 935, height: 165 },
        about: { x: 0, y: 960, width: 935, height: 205 },
        testimonials: { x: 0, y: 1165, width: 935, height: 135 },
        "contact-map": { x: 0, y: 1300, width: 935, height: 200 },
        footer: { x: 0, y: 1500, width: 935, height: 183 },
      },
      MOBILE: {
        header: mobileHeader(),
        hero: { x: 0, y: 90, width: 724, height: 282 },
        trustmetrics: { x: 0, y: 372, width: 724, height: 100 },
        search: { x: 0, y: 472, width: 724, height: 275 },
        "featured-rentals": { x: 0, y: 747, width: 724, height: 305 },
        "featured-projects": { x: 0, y: 1052, width: 724, height: 170 },
        about: { x: 0, y: 1222, width: 724, height: 290 },
        testimonials: { x: 0, y: 1512, width: 724, height: 165 },
        "contact-map": { x: 0, y: 1677, width: 724, height: 235 },
        footer: { x: 0, y: 1912, width: 724, height: 260 },
      },
    },
  },
  {
    key: "02-chothue",
    route: "/cho-thue",
    navigateTo: "/cho-thue",
    masterRegions: { WEB: { header: SHARED_HEADER_WEB }, MOBILE: { header: mobileHeader() } },
  },
  {
    key: "03-chitietbds",
    route: "/cho-thue/[slug]",
    navigateTo: "/cho-thue/can-ho-sunrise-city-view",
    masterRegions: { WEB: { header: SHARED_HEADER_WEB }, MOBILE: { header: mobileHeader() } },
  },
  {
    key: "04-duan",
    route: "/du-an",
    navigateTo: "/du-an",
    masterRegions: { WEB: { header: SHARED_HEADER_WEB }, MOBILE: { header: mobileHeader() } },
  },
  {
    key: "05-chitietduan",
    route: "/du-an/[slug]",
    navigateTo: "/du-an/sun-galaxy-complex",
    masterRegions: { WEB: { header: SHARED_HEADER_WEB }, MOBILE: { header: mobileHeader() } },
  },
];

const VIEWPORTS = {
  WEB: { cssWidth: 935, cssHeight: 1683, deviceScaleFactor: 1, expectedWidth: 935, expectedHeight: 1683 },
  MOBILE: { cssWidth: 362, cssHeight: 1086, deviceScaleFactor: 2, expectedWidth: 724, expectedHeight: 2172 },
} as const;

interface RegionEntry {
  name: string;
  masterBox: { x: number; y: number; width: number; height: number } | null;
  actualBox: { x: number; y: number; width: number; height: number } | null;
  deltaX: number | null;
  deltaY: number | null;
  deltaWidth: number | null;
  deltaHeight: number | null;
}

interface ReportEntry {
  route: string;
  viewport: "WEB" | "MOBILE";
  masterDimensions: { width: number; height: number };
  actualDimensions: { width: number; height: number };
  dimensionPass: boolean;
  diffPixels: number | null;
  diffPixelRatio: number | null;
  round3TrueDiffPixelRatio: number | null;
  absoluteImprovement: number | null;
  percentageImprovement: number | null;
  threshold: number;
  maxDiffPixelRatio: number;
  automatedPass: boolean;
  regressedVsRound3: boolean;
  playwrightToHaveScreenshotPass: boolean;
  masterPath: string;
  actualPath: string;
  diffPath: string | null;
  overlayPath: string | null;
  regions: RegionEntry[];
  // Section 1 — evidence provenance
  implementationCommit: string;
  captureSourceCommit: string;
  gitStatusBeforeCapture: string;
  gitStatusAfterCapture: string;
  browserVersion: string;
  renderMode: string;
  screenshotSha256: string;
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
    // Non-null: i iterates [0, overlay.length) where overlay.length ===
    // master.data.length === actual.data.length (all four buffers are
    // width*height*4 for the same width/height by construction).
    overlay[i] = Math.round((master.data[i]! + actual.data[i]!) / 2);
    overlay[i + 1] = Math.round((master.data[i + 1]! + actual.data[i + 1]!) / 2);
    overlay[i + 2] = Math.round((master.data[i + 2]! + actual.data[i + 2]!) / 2);
    overlay[i + 3] = 255;
  }
  await sharp(overlay, { raw: { width, height, channels: 4 } }).png().toFile(outPath);
}

const IMPLEMENTATION_COMMIT = process.env.PHA3_IMPLEMENTATION_COMMIT ?? "unknown";
const CAPTURE_SOURCE_COMMIT = process.env.PHA3_CAPTURE_SOURCE_COMMIT ?? "unknown";
const GIT_STATUS_BEFORE = process.env.PHA3_GIT_STATUS_BEFORE ?? "unknown";
const GIT_STATUS_AFTER = process.env.PHA3_GIT_STATUS_AFTER ?? "unknown";

for (const capture of CAPTURES) {
  for (const [viewportName, vp] of Object.entries(VIEWPORTS) as [keyof typeof VIEWPORTS, (typeof VIEWPORTS)[keyof typeof VIEWPORTS]][]) {
    const name = `${viewportName.toLowerCase()}-${capture.key}`;

    test(`${viewportName} ${capture.route}`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: vp.cssWidth, height: vp.cssHeight },
        deviceScaleFactor: vp.deviceScaleFactor,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      await page.goto(capture.navigateTo, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(150);

      const regionBoxes = await page.evaluate(() => {
        const out: Record<string, { x: number; y: number; width: number; height: number }> = {};
        document.querySelectorAll<HTMLElement>("[data-qa-region]").forEach((el) => {
          const key = el.getAttribute("data-qa-region")!;
          const r = el.getBoundingClientRect();
          out[key] = { x: r.x, y: r.y, width: r.width, height: r.height };
        });
        return out;
      });
      const dsf = vp.deviceScaleFactor;
      const scaledActualRegions: Record<string, { x: number; y: number; width: number; height: number }> = {};
      for (const [k, box] of Object.entries(regionBoxes)) {
        scaledActualRegions[k] = { x: box.x * dsf, y: box.y * dsf, width: box.width * dsf, height: box.height * dsf };
      }

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

      const round3Ratio = ROUND3_TRUE_BASELINE[capture.route]?.[viewportName] ?? null;
      const absoluteImprovement = diffPixelRatio !== null && round3Ratio !== null ? round3Ratio - diffPixelRatio : null;
      const percentageImprovement =
        absoluteImprovement !== null && round3Ratio !== null && round3Ratio !== 0 ? absoluteImprovement / round3Ratio : null;
      const regressedVsRound3 = absoluteImprovement !== null && absoluteImprovement < 0;

      const masterRegions = capture.masterRegions[viewportName] ?? {};
      const allRegionNames = new Set([...Object.keys(masterRegions), ...Object.keys(scaledActualRegions)]);
      const regions: RegionEntry[] = Array.from(allRegionNames).map((rname) => {
        const mb = masterRegions[rname] ?? null;
        const ab = scaledActualRegions[rname] ?? null;
        return {
          name: rname,
          masterBox: mb,
          actualBox: ab,
          deltaX: mb && ab ? Math.round(ab.x - mb.x) : null,
          deltaY: mb && ab ? Math.round(ab.y - mb.y) : null,
          deltaWidth: mb && ab ? Math.round(ab.width - mb.width) : null,
          deltaHeight: mb && ab ? Math.round(ab.height - mb.height) : null,
        };
      });

      const screenshotSha256 = crypto.createHash("sha256").update(fs.readFileSync(actualPath)).digest("hex");

      results.push({
        route: capture.route,
        viewport: viewportName,
        masterDimensions,
        actualDimensions,
        dimensionPass,
        diffPixels,
        diffPixelRatio,
        round3TrueDiffPixelRatio: round3Ratio,
        absoluteImprovement,
        percentageImprovement,
        threshold: PIXELMATCH_THRESHOLD,
        maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO,
        automatedPass: dimensionPass && automatedPass,
        regressedVsRound3,
        playwrightToHaveScreenshotPass,
        masterPath: path.relative(process.cwd(), masterPath),
        actualPath: path.relative(process.cwd(), actualPath),
        diffPath: diffPath ? path.relative(process.cwd(), diffPath) : null,
        overlayPath: overlayPath ? path.relative(process.cwd(), overlayPath) : null,
        regions,
        implementationCommit: IMPLEMENTATION_COMMIT,
        captureSourceCommit: CAPTURE_SOURCE_COMMIT,
        gitStatusBeforeCapture: GIT_STATUS_BEFORE,
        gitStatusAfterCapture: GIT_STATUS_AFTER,
        browserVersion: browser.version(),
        renderMode: "next start (production build)",
        screenshotSha256,
        note,
      });

      console.log(
        `${viewportName} ${capture.route} -> round3=${round3Ratio !== null ? (round3Ratio * 100).toFixed(3) + "%" : "n/a"} round4=${diffPixelRatio !== null ? (diffPixelRatio * 100).toFixed(3) + "%" : "n/a"} regressed=${regressedVsRound3}`,
      );

      await context.close();
    });
  }
}

test.afterAll(async () => {
  fs.writeFileSync(path.join(OUT_DIR, "report.json"), JSON.stringify(results, null, 2));
  console.log(`\nWrote ${results.length} results to ${path.join(OUT_DIR, "report.json")}`);
});
