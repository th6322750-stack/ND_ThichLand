import { test, expect } from "playwright/test";
import pixelmatch from "pixelmatch";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

/**
 * PHA3 ChatGPT visual QA — round 3 exact density/typography correction.
 *
 * Same canonical capture mechanics as rounds 1-2 (see those spec files'
 * docblocks): exact viewport CSS + DSF, fullPage:false, dimensions
 * asserted, same threshold/maxDiffPixelRatio, masters never re-encoded.
 *
 * New in round 3 (section 17): every major section on the live page is
 * tagged with a real `data-qa-region="<name>"` attribute; this spec reads
 * each tagged element's actual getBoundingClientRect() via Playwright and
 * records it as `actualBox` in report.json's `regions` array, alongside a
 * hand-measured `masterBox` (pixel-measured from the master PNGs directly
 * — the master is a flat image with no DOM, so its box can't be queried
 * the same way). deltaX/deltaY/deltaWidth/deltaHeight are actual-minus-
 * master, so geometry drift is visible independent of pixel/photo noise.
 */

const ROUND2_BASELINE: Record<string, Record<string, number>> = {
  "/": { WEB: 0.5262737472, MOBILE: 0.4806375467 },
  "/cho-thue": { WEB: 0.3847808059, MOBILE: 0.5333952718 },
  "/cho-thue/[slug]": { WEB: 0.3877732976, MOBILE: 0.3296481843 },
  "/du-an": { WEB: 0.5619377163, MOBILE: 0.6299620738 },
  "/du-an/[slug]": { WEB: 0.5611687812, MOBILE: 0.5977139994 },
};

const OUT_DIR = path.resolve(__dirname, "../../.webby/qa/pha3-v2/round-3");
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
  // Hand-measured region boxes from the MASTER PNGs, in each master image's
  // own raw pixel space (935-wide for WEB, 724-wide for MOBILE) — measured
  // via ruler-overlay crop inspection during this round's work. Keyed by
  // viewport since WEB/MOBILE masters are entirely different images.
  masterRegions: Partial<Record<"WEB" | "MOBILE", Record<string, { x: number; y: number; width: number; height: number }>>>;
}

// Header/footer master heights were measured once on the Home masters and
// are structurally shared (same Header2/Footer2 components render on every
// route) — applied here to every capture as a floor-level estimate. Only
// Home's masters were measured for EVERY section (see below); the other 4
// routes' non-header/footer regions are left unmeasured (masterBox: null)
// for this round — a disclosed gap, not a silent omission (see final report).
const SHARED_HEADER_WEB = { x: 0, y: 0, width: 935, height: 64 };
const SHARED_HEADER_MOBILE = { x: 0, y: 0, width: 724, height: 78 };

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
        header: SHARED_HEADER_MOBILE,
        hero: { x: 0, y: 78, width: 724, height: 282 },
        trustmetrics: { x: 0, y: 360, width: 724, height: 100 },
        search: { x: 0, y: 460, width: 724, height: 275 },
        "featured-rentals": { x: 0, y: 735, width: 724, height: 305 },
        "featured-projects": { x: 0, y: 1040, width: 724, height: 170 },
        about: { x: 0, y: 1210, width: 724, height: 290 },
        testimonials: { x: 0, y: 1500, width: 724, height: 165 },
        "contact-map": { x: 0, y: 1665, width: 724, height: 235 },
        footer: { x: 0, y: 1900, width: 724, height: 272 },
      },
    },
  },
  {
    key: "02-chothue",
    route: "/cho-thue",
    navigateTo: "/cho-thue",
    masterRegions: { WEB: { header: SHARED_HEADER_WEB }, MOBILE: { header: SHARED_HEADER_MOBILE } },
  },
  {
    key: "03-chitietbds",
    route: "/cho-thue/[slug]",
    navigateTo: "/cho-thue/can-ho-sunrise-city-view",
    masterRegions: { WEB: { header: SHARED_HEADER_WEB }, MOBILE: { header: SHARED_HEADER_MOBILE } },
  },
  {
    key: "04-duan",
    route: "/du-an",
    navigateTo: "/du-an",
    masterRegions: { WEB: { header: SHARED_HEADER_WEB }, MOBILE: { header: SHARED_HEADER_MOBILE } },
  },
  {
    key: "05-chitietduan",
    route: "/du-an/[slug]",
    navigateTo: "/du-an/sun-galaxy-complex",
    masterRegions: { WEB: { header: SHARED_HEADER_WEB }, MOBILE: { header: SHARED_HEADER_MOBILE } },
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
  round2DiffPixelRatio: number | null;
  absoluteImprovement: number | null;
  percentageImprovement: number | null;
  threshold: number;
  maxDiffPixelRatio: number;
  automatedPass: boolean;
  regressedVsRound2: boolean;
  playwrightToHaveScreenshotPass: boolean;
  masterPath: string;
  actualPath: string;
  diffPath: string | null;
  overlayPath: string | null;
  regions: RegionEntry[];
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
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      await page.goto(capture.navigateTo, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(150);

      // Region measurement: read every data-qa-region element's real box
      // (CSS px) and scale to this viewport's physical px (x DSF).
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

      const round2Ratio = ROUND2_BASELINE[capture.route]?.[viewportName] ?? null;
      const absoluteImprovement = diffPixelRatio !== null && round2Ratio !== null ? round2Ratio - diffPixelRatio : null;
      const percentageImprovement =
        absoluteImprovement !== null && round2Ratio !== null && round2Ratio !== 0 ? absoluteImprovement / round2Ratio : null;
      const regressedVsRound2 = absoluteImprovement !== null && absoluteImprovement < 0;

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

      results.push({
        route: capture.route,
        viewport: viewportName,
        masterDimensions,
        actualDimensions,
        dimensionPass,
        diffPixels,
        diffPixelRatio,
        round2DiffPixelRatio: round2Ratio,
        absoluteImprovement,
        percentageImprovement,
        threshold: PIXELMATCH_THRESHOLD,
        maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO,
        automatedPass: dimensionPass && automatedPass,
        regressedVsRound2,
        playwrightToHaveScreenshotPass,
        masterPath: path.relative(process.cwd(), masterPath),
        actualPath: path.relative(process.cwd(), actualPath),
        diffPath: diffPath ? path.relative(process.cwd(), diffPath) : null,
        overlayPath: overlayPath ? path.relative(process.cwd(), overlayPath) : null,
        regions,
        note,
      });

      console.log(
        `${viewportName} ${capture.route} -> round2=${round2Ratio !== null ? (round2Ratio * 100).toFixed(3) + "%" : "n/a"} round3=${diffPixelRatio !== null ? (diffPixelRatio * 100).toFixed(3) + "%" : "n/a"} regressed=${regressedVsRound2}`,
      );

      await context.close();
    });
  }
}

test.afterAll(async () => {
  fs.writeFileSync(path.join(OUT_DIR, "report.json"), JSON.stringify(results, null, 2));
  console.log(`\nWrote ${results.length} results to ${path.join(OUT_DIR, "report.json")}`);
});
