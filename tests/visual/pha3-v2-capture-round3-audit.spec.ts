import { test } from "playwright/test";
import { chromium } from "playwright/test";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

/**
 * PHA3 round 4, section 1 — evidence provenance audit.
 *
 * Re-captures the same 10 canonical screens straight from a clean checkout
 * of the reviewed commit, independent of the committed round-3/actual/*.png
 * files, so the two can be SHA256-compared afterwards. Does not touch
 * round-3/ at all; writes only under round-3-audit/.
 */

const OUT_DIR = path.resolve(__dirname, "../../.webby/qa/pha3-v2/round-3-audit");
fs.mkdirSync(OUT_DIR, { recursive: true });

const CAPTURES = [
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

interface AuditEntry {
  route: string;
  viewport: string;
  implementationCommit: string;
  captureSourceCommit: string;
  gitStatusBeforeCapture: string;
  gitStatusAfterCapture: string;
  browserVersion: string;
  renderMode: string;
  viewportCss: { width: number; height: number };
  deviceScaleFactor: number;
  screenshotDimensions: { width: number; height: number };
  screenshotPath: string;
  screenshotSha256: string;
}

const auditResults: AuditEntry[] = [];

test("capture round-3-audit evidence from clean a20313b checkout", async () => {
  const commit = process.env.PHA3_CAPTURE_SOURCE_COMMIT ?? "unknown";
  const gitStatusBefore = process.env.PHA3_GIT_STATUS_BEFORE ?? "unknown";
  const gitStatusAfter = process.env.PHA3_GIT_STATUS_AFTER ?? "unknown";

  const browser = await chromium.launch();
  const browserVersion = browser.version();

  for (const capture of CAPTURES) {
    for (const [viewportName, vp] of Object.entries(VIEWPORTS) as [keyof typeof VIEWPORTS, (typeof VIEWPORTS)[keyof typeof VIEWPORTS]][]) {
      const name = `${viewportName.toLowerCase()}-${capture.key}`;
      const context = await browser.newContext({
        viewport: { width: vp.cssWidth, height: vp.cssHeight },
        deviceScaleFactor: vp.deviceScaleFactor,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      await page.goto(capture.navigateTo, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(150);

      const screenshotPath = path.join(OUT_DIR, `${name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });

      const meta = await sharp(screenshotPath).metadata();
      const buf = fs.readFileSync(screenshotPath);
      const sha256 = crypto.createHash("sha256").update(buf).digest("hex");

      auditResults.push({
        route: capture.route,
        viewport: viewportName,
        implementationCommit: commit,
        captureSourceCommit: commit,
        gitStatusBeforeCapture: gitStatusBefore,
        gitStatusAfterCapture: gitStatusAfter,
        browserVersion,
        renderMode: "next start (production build)",
        viewportCss: { width: vp.cssWidth, height: vp.cssHeight },
        deviceScaleFactor: vp.deviceScaleFactor,
        screenshotDimensions: { width: meta.width ?? 0, height: meta.height ?? 0 },
        screenshotPath: path.relative(process.cwd(), screenshotPath),
        screenshotSha256: sha256,
      });

      await context.close();
    }
  }

  await browser.close();

  fs.writeFileSync(path.join(OUT_DIR, "audit-metadata.json"), JSON.stringify(auditResults, null, 2));
  console.log(`Wrote ${auditResults.length} audit entries to ${path.join(OUT_DIR, "audit-metadata.json")}`);
});
