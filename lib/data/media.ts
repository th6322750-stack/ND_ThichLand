import type { MediaRecord } from "@/lib/server/media/repository";

const PLACEHOLDERS = [
  "/assets/placeholders/property-placeholder.svg",
  "/assets/placeholders/project-placeholder.svg",
  "/assets/placeholders/news-placeholder.svg",
];

/** Fixture policy (contract): design/demo content, seeded for local/dev/test only — same treatment
 * as the rental/project/news fixture seeds. Unlike those, these placeholders are served directly
 * as public static assets (webViewLink is a real public path), so they never touch the blob store. */
export const mediaFixtures: Omit<MediaRecord, "createdAt">[] = Array.from({ length: 12 }, (_, i) => ({
  id: `media:fixture-${String(i + 1).padStart(2, "0")}`,
  driveFileId: "",
  filename: `media-${String(i + 1).padStart(2, "0")}.jpg`,
  mimeType: "image/svg+xml",
  sizeBytes: 0,
  // Non-null: i % PLACEHOLDERS.length is always in [0, length) by construction.
  webViewLink: PLACEHOLDERS[i % PLACEHOLDERS.length]!,
  uploadedBy: "seed",
}));
