/**
 * Absolute origin for canonical/OG URLs, sitemap.xml and robots.txt.
 *
 * Set NEXT_PUBLIC_SITE_URL on the deployment. Without it this falls back to
 * localhost, which is right for local QA and harmless in preview — but a
 * production deploy that forgets it will emit localhost canonicals.
 *
 * Kept out of app/layout.tsx so the sitemap/robots route handlers don't have
 * to import the root layout (and with it globals.css and next/font) just to
 * read one string.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
