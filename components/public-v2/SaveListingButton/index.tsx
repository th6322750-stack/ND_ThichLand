"use client";

import { Icon2 as Icon } from "@/components/public-v2/Icon2";
import { useSavedListings } from "@/lib/useSavedListings";

/**
 * The heart affordance on a result row. Kept as its own client island so
 * PropertyListRow2 (and any other card) stays a Server Component — only the
 * button itself hydrates, not the whole list.
 *
 * Saved state is conveyed by the filled pill background + the pressed
 * state + the accessible label, not by hue alone (only one heart glyph
 * exists in the frozen icon set, and no new asset may be introduced here).
 */
export function SaveListingButton({
  slug,
  size = 15,
  className = "",
  savedClassName = "bg-[#880206] text-white",
  idleClassName = "bg-white/90 text-[#880206]",
}: {
  slug: string;
  size?: number;
  className?: string;
  savedClassName?: string;
  idleClassName?: string;
}) {
  const { isSaved, toggle } = useSavedListings();
  const saved = isSaved(slug);

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={saved}
      aria-label={saved ? "Bỏ khỏi danh sách yêu thích" : "Lưu vào danh sách yêu thích"}
      title={saved ? "Bỏ lưu" : "Lưu tin này"}
      className={`transition-colors duration-fast ease-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#880206] ${
        saved ? savedClassName : idleClassName
      } ${className}`}
    >
      <Icon name="heart" size={size} />
    </button>
  );
}
