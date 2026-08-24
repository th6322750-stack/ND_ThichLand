import { test } from "playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * USER_APPROVED_PREMIUM_WIDE_SCALE section 19/20 — wide-desktop evidence
 * capture (1440px/1920px). Screenshots only, no pixelmatch: the old 935px
 * canonical masters are captures of the pre-wide-scale design this task
 * explicitly supersedes at >=1440px (section 1's authority order), so
 * diffing against them would just re-flag every intentional scale-up as a
 * "regression." Each screenshot is full-page evidence for the ChatGPT
 * review this task's handoff report points to.
 */

const OUT_DIR = path.resolve(process.cwd(), ".webby/qa/pha3-v2/wide-scale");
fs.mkdirSync(OUT_DIR, { recursive: true });

const ROUTES: { path: string; slug: string; needsSlug?: "cho-thue" | "du-an" }[] = [
  { path: "/", slug: "home" },
  { path: "/cho-thue", slug: "cho-thue" },
  { path: "/cho-thue/[slug]", slug: "cho-thue-slug", needsSlug: "cho-thue" },
  { path: "/du-an", slug: "du-an" },
  { path: "/du-an/[slug]", slug: "du-an-slug", needsSlug: "du-an" },
];

const WIDTHS_BY_ROUTE: Record<string, number[]> = {
  home: [1440, 1920],
  "cho-thue": [1920],
  "cho-thue-slug": [1920],
  "du-an": [1920],
  "du-an-slug": [1920],
};

for (const route of ROUTES) {
  // Non-null: ROUTES and WIDTHS_BY_ROUTE are hand-authored together right
  // above — every route.slug here has a matching WIDTHS_BY_ROUTE entry.
  for (const width of WIDTHS_BY_ROUTE[route.slug]!) {
    test(`wide capture ${route.slug} @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1200 });

      let target = route.path;
      if (route.needsSlug) {
        await page.goto(route.needsSlug === "cho-thue" ? "/cho-thue" : "/du-an", { waitUntil: "networkidle" });
        const href = await page.locator(`a[href^="/${route.needsSlug}/"]`).first().getAttribute("href");
        if (!href) throw new Error(`No ${route.needsSlug} detail link found in fixture data`);
        target = href;
      }

      await page.goto(target, { waitUntil: "networkidle" });

      const hasHorizontalScroll = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      if (hasHorizontalScroll) {
        throw new Error(`Horizontal scroll detected at ${route.slug} @ ${width}px`);
      }

      await page.screenshot({
        path: path.join(OUT_DIR, `${route.slug}-${width}.png`),
        fullPage: true,
      });
    });
  }
}
