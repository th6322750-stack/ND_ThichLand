// Plain (no server-only guard) — NEXT_PUBLIC_ variables are inherently
// client-safe by Next.js convention, and this is imported from both server
// pages and client components (StickyMobileActions), same treatment as
// lib/authConstants.ts.

const HOTLINE_FALLBACK_HREF = "tel:0986602203";

/** Contract (Task 11): only replace the hotline fallback when NEXT_PUBLIC_ZALO_URL is
 * explicitly configured — never invent a zalo.me/... URL as production truth. */
export function getZaloUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_ZALO_URL;
  return url && url.trim() ? url.trim() : null;
}

/** The one helper every Zalo CTA surface must use (contract: "same configuration helper"). */
export function getZaloHref(): string {
  return getZaloUrl() ?? HOTLINE_FALLBACK_HREF;
}
