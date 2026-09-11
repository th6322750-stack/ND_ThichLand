import type { IconName } from "@/components/icons";

export type { IconName };

interface Icon2Props {
  name: IconName;
  className?: string;
  size?: number;
}

// public-v2-only icon renderer — a CSS-masked <span> (background-color:
// currentColor, masked by the frozen SVG's silhouette) instead of the
// legacy Icon's <img>/next/image. An externally-referenced SVG's own
// `stroke="currentColor"` resolves against the SVG document's own (black)
// default, not the embedding page's CSS, so `text-*` classes on the legacy
// <img>-rendered icon are silent no-ops there (PHA3 round 3, section 15).
// Kept as a SEPARATE component (not a change to the shared
// components/icons, which the out-of-scope legacy/admin pages still use
// unmodified) so this fix stays inside the PHA2/PHA3 public-v2 footprint.
// Reads the SAME frozen /assets/icons/*.svg files unmodified — only how
// the icon is painted changes, never the asset.
export function Icon2({ name, className, size = 20 }: Icon2Props) {
  const maskUrl = `url(/assets/icons/${name}.svg)`;
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={`inline-block shrink-0 bg-current ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        WebkitMaskImage: maskUrl,
        maskImage: maskUrl,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}
