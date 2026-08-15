import { test, expect } from "playwright/test";
import pixelmatch from "pixelmatch";
import sharp from "sharp";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

/**
 * PHA3 ChatGPT visual QA — round 6, user-approved project-first Home +
 * final visual convergence. Same self-contained git-provenance pattern as
 * round 5 (see that spec's docblock) — carried forward unchanged since it
 * already satisfies the "no unknown provenance" requirement.
 *
 * New in round 6 (section 13): DIFF_CLASSIFICATION statically tags each of
 * the 10 screens into the round-6 taxonomy (A-G). Home's route/viewport is
 * explicitly USER_APPROVED_PRODUCT_DELTA — its raw diffPixelRatio against
 * the OLD PHA1 master is still recorded for transparency, but per section 2
 * it is no longer the acceptance metric for Home's section order.
 */

function git(args: string[]): string {
  return execFileSync("git", args, { cwd: process.cwd(), encoding: "utf8" }).trim();
}

function captureGitState() {
  const commit = git(["rev-parse", "HEAD"]);
  const trackedStatus = git(["status", "--porcelain", "--untracked-files=no"]);
  const untrackedOnly = git(["status", "--porcelain"])
    .split("\n")
    .filter((line) => line.startsWith("??"))
    .join("\n");
  return {
    commit,
    trackedClean: trackedStatus.length === 0,
    trackedStatusRaw: trackedStatus || "(clean)",
    untrackedArtifacts: untrackedOnly || "(none)",
  };
}

const BEFORE_STATE = captureGitState();

const ROUND5_BASELINE: Record<string, Record<string, number>> = {
  "/": { WEB: 0.45111003078917516, MOBILE: 0.43410101441754934 },
  "/cho-thue": { WEB: 0.27235678585159556, MOBILE: 0.4482311284759318 },
  "/cho-thue/[slug]": { WEB: 0.3229419072766037, MOBILE: 0.3475868156242687 },
  "/du-an": { WEB: 0.5204349249017384, MOBILE: 0.5817009299675427 },
  "/du-an/[slug]": { WEB: 0.3715862621178758, MOBILE: 0.31462460445855334 },
};

// Section 13 classification, per screen. Home is USER_APPROVED_PRODUCT_DELTA
// (section-order + search-bar redesign are explicit product decisions, not
// bugs); the 4 strict PHA1 route families are classified by their dominant
// remaining diff driver, per this round's actual measurement/investigation.
const DIFF_CLASSIFICATION: Record<string, Record<string, string[]>> = {
  "/": {
    WEB: ["USER_APPROVED_PRODUCT_DELTA"],
    MOBILE: ["USER_APPROVED_PRODUCT_DELTA"],
  },
  "/cho-thue": {
    WEB: ["ASSET_BLOCKED_NEEDS_CHATGPT", "DATA_TEXT_DIFF"],
    MOBILE: ["GEOMETRY_DIFF", "DATA_TEXT_DIFF"],
  },
  "/cho-thue/[slug]": {
    WEB: ["GEOMETRY_DIFF", "DATA_TEXT_DIFF"],
    MOBILE: ["GEOMETRY_DIFF", "DATA_TEXT_DIFF", "ANTIALIASING_NOISE"],
  },
  "/du-an": {
    WEB: ["ASSET_DIFF", "GEOMETRY_DIFF"],
    MOBILE: ["ASSET_DIFF", "GEOMETRY_DIFF", "DATA_TEXT_DIFF"],
  },
  "/du-an/[slug]": {
    WEB: ["ASSET_DIFF", "GEOMETRY_DIFF"],
    MOBILE: ["ASSET_DIFF", "GEOMETRY_DIFF"],
  },
};

const OUT_DIR = path.resolve(__dirname, "../../.webby/qa/pha3-v2/round-6");
const MASTER_DIR = path.join(OUT_DIR, "master");
const ACTUAL_DIR = path.join(OUT_DIR, "actual");
const DIFF_DIR = path.join(OUT_DIR, "diff");
const OVERLAY_DIR = path.join(OUT_DIR, "overlay");

const PIXELMATCH_THRESHOLD = 0.12;
const MAX_DIFF_PIXEL_RATIO = 0.005;

for (const dir of [MASTER_DIR, ACTUAL_DIR, DIFF_DIR, OVERLAY_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}
const ROUND5_MASTER_DIR = path.resolve(__dirname, "../../.webby/qa/pha3-v2/round-5/master");
for (const f of fs.readdirSync(ROUND5_MASTER_DIR)) {
  const dest = path.join(MASTER_DIR, f);
  if (!fs.existsSync(dest)) fs.copyFileSync(path.join(ROUND5_MASTER_DIR, f), dest);
}

type Box = { x: number; y: number; width: number; height: number };

interface CaptureSpec {
  key: string;
  route: string;
  navigateTo: string;
  masterRegions: Partial<Record<"WEB" | "MOBILE", Record<string, Box>>>;
}

const SHARED_HEADER_WEB: Box = { x: 0, y: 0, width: 935, height: 64 };
const mobileHeader = (h = 90): Box => ({ x: 0, y: 0, width: 724, height: h });

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
        "featured-projects": { x: 0, y: 505, width: 935, height: 290 },
        "featured-rentals": { x: 0, y: 795, width: 935, height: 165 },
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
      },
    },
  },
  {
    key: "02-chothue",
    route: "/cho-thue",
    navigateTo: "/cho-thue",
    masterRegions: {
      WEB: { header: SHARED_HEADER_WEB },
      MOBILE: { header: mobileHeader() },
    },
  },
  {
    key: "03-chitietbds",
    route: "/cho-thue/[slug]",
    navigateTo: "/cho-thue/can-ho-sunrise-city-view",
    masterRegions: {
      WEB: { header: SHARED_HEADER_WEB },
      MOBILE: {
        // Measured directly this round — the shared 90px estimate was
        // wrong for this route's own master (this one really is 130px).
        header: mobileHeader(130),
        gallery: { x: 0, y: 165, width: 724, height: 420 },
        summary: { x: 0, y: 600, width: 724, height: 145 },
        facts: { x: 0, y: 760, width: 724, height: 140 },
        highlights: { x: 0, y: 920, width: 724, height: 220 },
        actions: { x: 0, y: 1160, width: 724, height: 60 },
        "detail-tabs": { x: 0, y: 1280, width: 724, height: 320 },
        related: { x: 0, y: 1620, width: 724, height: 460 },
      },
    },
  },
  {
    key: "04-duan",
    route: "/du-an",
    navigateTo: "/du-an",
    masterRegions: {
      WEB: { header: SHARED_HEADER_WEB },
      MOBILE: {
        header: mobileHeader(),
        heading: { x: 0, y: 100, width: 724, height: 200 },
        "project-grid": { x: 0, y: 300, width: 724, height: 1130 },
        about: { x: 0, y: 1500, width: 724, height: 400 },
      },
    },
  },
  {
    key: "05-chitietduan",
    route: "/du-an/[slug]",
    navigateTo: "/du-an/sun-galaxy-complex",
    masterRegions: {
      WEB: { header: SHARED_HEADER_WEB },
      MOBILE: { header: mobileHeader() },
    },
  },
];

const VIEWPORTS = {
  WEB: { cssWidth: 935, cssHeight: 1683, deviceScaleFactor: 1, expectedWidth: 935, expectedHeight: 1683 },
  MOBILE: { cssWidth: 362, cssHeight: 1086, deviceScaleFactor: 2, expectedWidth: 724, expectedHeight: 2172 },
} as const;

interface RegionEntry {
  name: string;
  masterBox: Box | null;
  actualBox: Box | null;
  deltaX: number | null;
  deltaY: number | null;
  deltaWidth: number | null;
  deltaHeight: number | null;
  notVisibleInMaster?: true;
}

interface ReportEntry {
  route: string;
  viewport: "WEB" | "MOBILE";
  masterDimensions: { width: number; height: number };
  actualDimensions: { width: number; height: number };
  dimensionPass: boolean;
  diffPixels: number | null;
  diffPixelRatio: number | null;
  round5DiffPixelRatio: number | null;
  absoluteImprovement: number | null;
  percentageImprovement: number | null;
  threshold: number;
  maxDiffPixelRatio: number;
  automatedPass: boolean;
  regressedVsRound5: boolean;
  playwrightToHaveScreenshotPass: boolean;
  masterPath: string;
  actualPath: string;
  diffPath: string | null;
  overlayPath: string | null;
  regions: RegionEntry[];
  classification: string[];
  implementationCommit: string;
  captureSourceCommit: string;
  gitStatusBeforeCapture: string;
  gitStatusAfterCapture: string;
  browserVersion: string;
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

      const regionBoxes = await page.evaluate(() => {
        const out: Record<string, { x: number; y: number; width: number; height: number }> = {};
        document.querySelectorAll<HTMLElement>("[data-qa-region]").forEach((el) => {
          const key = el.getAttribute("data-qa-region")!;
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return;
          out[key] = { x: r.x, y: r.y, width: r.width, height: r.height };
        });
        return out;
      });
      const dsf = vp.deviceScaleFactor;
      const scaledActualRegions: Record<string, Box> = {};
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
        note = `Captured ${actualDimensions.width}x${actualDimensions.height}, expected ${vp.expectedWidth}x${vp.expectedHeight}.`;
      } else {
        const [masterRaw, actualRaw] = await Promise.all([
          sharp(masterPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
          sharp(actualPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
        ]);
        const { width, height } = masterRaw.info;
        const diffBuffer = Buffer.alloc(width * height * 4);
        diffPixels = pixelmatch(masterRaw.data, actualRaw.data, diffBuffer, width, height, { threshold: PIXELMATCH_THRESHOLD });
        diffPixelRatio = diffPixels / (width * height);
        automatedPass = diffPixelRatio <= MAX_DIFF_PIXEL_RATIO;

        diffPath = path.join(DIFF_DIR, `${name}.png`);
        await sharp(diffBuffer, { raw: { width, height, channels: 4 } }).png().toFile(diffPath);

        overlayPath = path.join(OVERLAY_DIR, `${name}.png`);
        await buildOverlay(masterPath, actualPath, overlayPath);
      }

      const round5Ratio = ROUND5_BASELINE[capture.route]?.[viewportName] ?? null;
      const absoluteImprovement = diffPixelRatio !== null && round5Ratio !== null ? round5Ratio - diffPixelRatio : null;
      const percentageImprovement =
        absoluteImprovement !== null && round5Ratio !== null && round5Ratio !== 0 ? absoluteImprovement / round5Ratio : null;
      const regressedVsRound5 = absoluteImprovement !== null && absoluteImprovement < 0;

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
          ...(mb === null ? { notVisibleInMaster: true as const } : {}),
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
        round5DiffPixelRatio: round5Ratio,
        absoluteImprovement,
        percentageImprovement,
        threshold: PIXELMATCH_THRESHOLD,
        maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO,
        automatedPass: dimensionPass && automatedPass,
        regressedVsRound5,
        playwrightToHaveScreenshotPass,
        masterPath: path.relative(process.cwd(), masterPath),
        actualPath: path.relative(process.cwd(), actualPath),
        diffPath: diffPath ? path.relative(process.cwd(), diffPath) : null,
        overlayPath: overlayPath ? path.relative(process.cwd(), overlayPath) : null,
        regions,
        classification: DIFF_CLASSIFICATION[capture.route]?.[viewportName] ?? [],
        implementationCommit: BEFORE_STATE.commit,
        captureSourceCommit: BEFORE_STATE.commit,
        gitStatusBeforeCapture: `tracked: ${BEFORE_STATE.trackedClean ? "clean" : BEFORE_STATE.trackedStatusRaw}; untracked: ${BEFORE_STATE.untrackedArtifacts}`,
        gitStatusAfterCapture: "SET_IN_AFTERALL",
        browserVersion: browser.version(),
        screenshotSha256,
        note,
      });

      console.log(
        `${viewportName} ${capture.route} -> round5=${round5Ratio !== null ? (round5Ratio * 100).toFixed(3) + "%" : "n/a"} round6=${diffPixelRatio !== null ? (diffPixelRatio * 100).toFixed(3) + "%" : "n/a"} regressed=${regressedVsRound5}`,
      );

      await context.close();
    });
  }
}

test.afterAll(async () => {
  const afterState = captureGitState();
  const afterStatusStr = `tracked: ${afterState.trackedClean ? "clean" : afterState.trackedStatusRaw}; untracked: ${afterState.untrackedArtifacts}`;
  for (const r of results) {
    r.gitStatusAfterCapture = afterStatusStr;
  }
  fs.writeFileSync(path.join(OUT_DIR, "report.json"), JSON.stringify(results, null, 2));
  console.log(`\nWrote ${results.length} results to ${path.join(OUT_DIR, "report.json")}`);
});
