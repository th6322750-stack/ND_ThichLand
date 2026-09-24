/**
 * Single source for "what image do we render when the record has none".
 *
 * Every card/hero on the public site used to index straight into a possibly
 * empty media array (`listing.media[0]`, `project.media[0]`, `article.cover`).
 * `next/image` throws on an `undefined`/empty `src`, so a CMS record saved
 * without a photo — entirely possible, media upload is optional in every
 * admin form — took the whole route down with a 500 instead of degrading.
 *
 * These placeholders are the repo's own neutral SVGs (public/assets/
 * placeholders/*), visibly "no photo yet" artwork — never another record's
 * photograph, which would misrepresent the listing.
 */
export const PROPERTY_PLACEHOLDER = "/assets/placeholders/property-placeholder.svg";
export const PROJECT_PLACEHOLDER = "/assets/placeholders/project-placeholder.svg";
export const NEWS_PLACEHOLDER = "/assets/placeholders/news-placeholder.svg";

/** First usable image of a media list, or the placeholder when there is none. */
export function firstMedia(media: readonly string[] | undefined, placeholder: string): string {
  const first = media?.find((src) => typeof src === "string" && src.trim() !== "");
  return first ?? placeholder;
}

/** Same guarantee for a single-image field (news cover). */
export function mediaSrc(src: string | undefined | null, placeholder: string): string {
  return src && src.trim() !== "" ? src : placeholder;
}
