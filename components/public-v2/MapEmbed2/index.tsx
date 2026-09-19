import { Icon2 as Icon } from "@/components/public-v2/Icon2";

/**
 * Plain, always-interactive Google Maps embed. Drag pans immediately; a plain
 * wheel scroll is deliberately left to move the PAGE (Google's own embed
 * shows "Sử dụng ctrl + cuộn để thu phóng bản đồ" and requires the modifier
 * itself, natively, with no API key or paid tier involved) — verified live:
 * a lone wheel scroll over the map moved the page, Ctrl+scroll zoomed the map.
 *
 * An earlier version second-guessed this and made the iframe inert
 * (pointer-events: none) until clicked, gated behind an invisible "Nhấn để
 * di chuyển bản đồ" hint that only faded in on hover — assuming Google's
 * embed would scroll-jack the page and trying to pre-empt that. It was
 * wrong on both counts: the embed already declines to scroll-jack, and the
 * gate itself was the bug — the hint was too easy to miss, so drag/zoom
 * looked broken until someone found the invisible button.
 */
export function MapEmbed2({
  src,
  title,
  directionsUrl,
  showPin = false,
}: {
  src: string;
  title: string;
  directionsUrl: string;
  /**
   * A decorative pin fixed at the map's centre. This address doesn't resolve
   * to an exact place in Google's own data (verified live: no info card, no
   * place marker, just the generic business dots every embed shows) — the
   * embed just centres on the searched query, so nothing on the map itself
   * says "this is the spot" without it.
   *
   * Purely symbolic: it does not track a real coordinate — the map's centre
   * already is the searched address, by definition of how the embed URL
   * works, so pinning the centre is honest, not a guess. Non-interactive:
   * "Chỉ đường" is the actual action, this only marks the spot.
   */
  showPin?: boolean;
}) {
  return (
    <div className="relative h-full w-full">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />

      {showPin && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-base -translate-x-1/2 -translate-y-full"
        >
          <div className="h-6 w-6 rotate-[-45deg] rounded-[50%_50%_50%_0] bg-[#880206] shadow-[0_3px_8px_-1px_rgba(0,0,0,0.45)]">
            <span className="absolute left-1/2 top-1/2 h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-white" />
          </div>
        </div>
      )}

      {/* Above the map so routing stays one tap away at all
          times. Top-right: Google's attribution runs along the bottom edge
          and its terms require it to stay legible, and the zoom/fullscreen
          controls sit bottom-right. */}
      <a
        href={directionsUrl}
        target="_blank"
        rel="noreferrer"
        className="absolute right-1 top-1 z-dropdown inline-flex items-center gap-1 rounded-sm bg-[#880206] px-2 py-[2px] text-[9px] font-semibold text-white shadow-[0_4px_14px_-2px_rgba(136,2,6,0.4)] transition-[background-color,transform] duration-fast ease-base hover:bg-[#70131B] active:scale-[0.97] motion-reduce:active:scale-100 min-[900px]:right-2 min-[900px]:top-2 min-[900px]:rounded-md min-[900px]:px-3 min-[900px]:py-[6px] min-[900px]:text-[11px] wide:text-[13px]"
      >
        Chỉ đường
        {/* The arrow costs ~14px of a ~160px-wide mobile map — the word alone
            already reads as the action there. */}
        <Icon name="arrow-right" size={12} className="hidden text-white min-[900px]:block" />
      </a>
    </div>
  );
}
