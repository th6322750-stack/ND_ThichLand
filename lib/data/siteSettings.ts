import type { SiteSettings } from "@/lib/types";

/**
 * The values that were hardcoded across app/(public-v2)/page.tsx,
 * components/public-v2/Footer2 and app/(public)/lien-he — copied verbatim,
 * not invented. They are the fallback whenever the settings record has not
 * been saved yet, so the public site never renders an empty contact panel.
 */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  address: "120 Nguyễn Xí, Phường 26, Quận Bình Thạnh, TP. HCM",
  mapQuery: "",
  phonePrimary: "0986 602 203",
  phoneSecondary: "0985 551 396",
  email: "info@ndthich.com.vn",
  hoursWeekday: "Thứ 2 - Thứ 7: 8:00 - 18:00",
  hoursWeekend: "Chủ nhật: 8:00 - 12:00",
  // Baked in as a real default, not left for the admin to upload each time:
  // on the demo Vercel deployment (no live Google Sheets/Drive configured
  // yet), an admin-uploaded file only lives in that one warm serverless
  // instance's memory — the next request can land on a different instance
  // that never saw it, and /api/media/[id] 404s (confirmed live). A static
  // file under public/, referenced from a hardcoded default, ships with the
  // build itself and is identical on every instance. This is the company's
  // own real profile (public/assets/v2/profile/ho-so-nang-luc-ndthich.pdf),
  // not a placeholder — same category as the address/phone/email defaults
  // above. Revisit once there's a real datastore (Sheets/Drive, or the
  // planned VPS + database move) and let admin uploads take over properly.
  profilePdfUrl: "/assets/v2/profile/ho-so-nang-luc-ndthich.pdf",
};

/** Digits only — what a tel: href needs. "0986 602 203" -> "0986602203". */
export function telHref(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

/** What the embedded map geocodes: the explicit override, else the address. */
export function mapQueryOf(settings: SiteSettings): string {
  return settings.mapQuery.trim() || settings.address.trim();
}
