import { expect, test } from "playwright/test";

const PUBLIC_ROUTES = ["/", "/cho-thue", "/du-an", "/tin-tuc", "/gioi-thieu", "/lien-he"];

async function jsonLdTypes(page: import("playwright/test").Page): Promise<string[]> {
  const values = await page.locator('script[type="application/ld+json"]').allTextContents();
  return values.flatMap((value) => {
    const parsed = JSON.parse(value) as Record<string, unknown> | Record<string, unknown>[];
    return (Array.isArray(parsed) ? parsed : [parsed]).flatMap((entry) => {
      const type = entry["@type"];
      return Array.isArray(type) ? type.map(String) : type ? [String(type)] : [];
    });
  });
}

test("every public landing page exposes complete, indexable and unique metadata", async ({ page }) => {
  const titles = new Set<string>();

  for (const route of PUBLIC_ROUTES) {
    await page.goto(route);
    const title = await page.title();
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    const description = await page.locator('meta[name="description"]').getAttribute("content");

    expect(title.length, `${route} title`).toBeGreaterThan(12);
    expect(titles.has(title), `${route} must have a unique title`).toBe(false);
    titles.add(title);
    expect(new URL(canonical || "http://invalid").pathname).toBe(route);
    expect(description?.length, `${route} description`).toBeGreaterThan(40);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index, follow/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /^https?:\/\//);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    await expect(page.locator('meta[name="keywords"]')).toHaveCount(0);
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
    await expect(page.locator("h1"), `${route} primary heading`).toHaveCount(1);
    expect(
      await page.locator("img").evaluateAll((images) =>
        images.filter((image) => image.getAttribute("alt") === null).map((image) => image.getAttribute("src")),
      ),
      `${route} images without alt`,
    ).toEqual([]);

    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(scripts.length, `${route} JSON-LD`).toBeGreaterThanOrEqual(2);
    scripts.forEach((script) => expect(() => JSON.parse(script)).not.toThrow());
    expect(await jsonLdTypes(page)).toContain("Organization");
  }
});

test("admin and API surfaces are excluded without leaking public canonical/social tags", async ({ page, request }) => {
  const response = await page.goto("/admin/login");
  expect(response?.headers()["x-robots-tag"]).toContain("noindex");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('meta[property^="og:"]')).toHaveCount(0);
  await expect(page.locator('meta[name^="twitter:"]')).toHaveCount(0);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);

  const apiResponse = await request.get("/api/media/not-found");
  expect(apiResponse.headers()["x-robots-tag"]).toContain("noindex");
});

test("robots and sitemap advertise only canonical public URLs", async ({ request, baseURL }) => {
  const robotsResponse = await request.get("/robots.txt");
  expect(robotsResponse.ok()).toBe(true);
  const robots = await robotsResponse.text();
  expect(robots).toContain("Allow: /");
  expect(robots).toContain("Disallow: /api/");
  expect(robots).not.toContain("Disallow: /admin");
  expect(robots).toContain(`${baseURL}/sitemap.xml`);

  const sitemapResponse = await request.get("/sitemap.xml");
  expect(sitemapResponse.ok()).toBe(true);
  const sitemap = await sitemapResponse.text();
  for (const route of PUBLIC_ROUTES) {
    expect(sitemap).toContain(`<loc>${baseURL}${route}</loc>`);
  }
  expect(sitemap).not.toContain("/admin");
  expect(sitemap).not.toContain("/api/");
  expect(sitemap).toContain("<image:image>");
});

test("detail pages expose canonical breadcrumbs and entity-specific schema", async ({ page }) => {
  const cases = [
    { listing: "/cho-thue", href: /^\/cho-thue\/[^/]+$/, type: "WebPage" },
    { listing: "/du-an", href: /^\/du-an\/[^/]+$/, type: "WebPage" },
    { listing: "/tin-tuc", href: /^\/tin-tuc\/[^/]+$/, type: "Article" },
  ];

  for (const item of cases) {
    await page.goto(item.listing);
    const detailHref = await page.locator("a").evaluateAll((links, source) => {
      const pattern = new RegExp(source);
      return links.map((link) => link.getAttribute("href") || "").find((href) => pattern.test(href)) || null;
    }, item.href.source);
    expect(detailHref, `${item.listing} detail link`).toBeTruthy();

    await page.goto(detailHref as string);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(new URL(canonical || "http://invalid").pathname).toBe(detailHref);
    const types = await jsonLdTypes(page);
    expect(types).toContain("BreadcrumbList");
    expect(types).toContain(item.type);
  }
});

test("missing detail pages return 404 without homepage canonical or social metadata", async ({ page }) => {
  for (const route of [
    "/cho-thue/khong-ton-tai-seo",
    "/du-an/khong-ton-tai-seo",
    "/tin-tuc/khong-ton-tai-seo",
  ]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(404);
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).not.toHaveCount(0);
    await expect(page.locator('meta[name="robots"][content*="index, follow"]')).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await expect(page.locator('meta[property^="og:"]')).toHaveCount(0);
  }
});
