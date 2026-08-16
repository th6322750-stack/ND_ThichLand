import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";

interface ProjectCardOverlay2Props {
  slug: string;
  name: string;
  location: string;
  image: string;
  showButton?: boolean;
  /** Home page's mobile row (4 narrow cards in one row, per master) needs much smaller type than the 3-col /du-an grid. */
  compact?: boolean;
  /** Mobile aspect ratio — Home's 4-col row is portrait (4/5); /du-an's single-column mobile list is wide landscape, per 04_DuAn_MOBILE.png. */
  mobileAspect?: string;
  /** Desktop aspect ratio — /du-an's 3-col grid is ~272/292 (near-square); Home's 4-col compact row is shorter, ~199/135, per 01_TrangChu_WEB.png. */
  desktopAspect?: string;
}

// Dark-gradient-overlay project card — home featured projects and the
// /du-an grid. Title + location sit over a bottom gradient on the full
// photo. /du-an's card (showButton) additionally has a "Xem chi tiết"
// button — master (04_DuAn_WEB.png) renders that button OUTSIDE the photo
// on its own white footer strip, not overlaid on the image, so this is a
// two-part card (image box + white button strip) rather than one absolute
// overlay stack when showButton is set.
export function ProjectCardOverlay2({
  slug,
  name,
  location,
  image,
  showButton = false,
  compact = false,
  mobileAspect = "4/5",
  desktopAspect = "272/292",
}: ProjectCardOverlay2Props) {
  const media = (
    <div
      className="group relative block aspect-[var(--mobile-aspect)] overflow-hidden min-[900px]:aspect-[var(--desktop-aspect)]"
      style={{ "--mobile-aspect": mobileAspect, "--desktop-aspect": desktopAspect } as CSSProperties}
    >
      <Image src={image} alt={name} fill className="object-cover transition-transform group-hover:scale-105" unoptimized />
      {/* Client feedback: white title/location text sank into brighter
          photos (sky, light facades) — strengthened the mid-stop so there's
          real darkening behind the text without flattening the whole
          image. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className={compact ? "absolute inset-x-0 bottom-0 p-[6px] min-[900px]:p-3" : "absolute inset-x-0 bottom-0 p-4"}>
        <h3
          className={
            compact
              ? "line-clamp-1 text-[8px] font-bold text-white min-[900px]:text-[14px]"
              : "text-[16px] font-bold text-white min-[900px]:text-[17px]"
          }
        >
          {name}
        </h3>
        <p
          className={
            compact
              ? "mt-[2px] line-clamp-1 text-[6px] text-white/90 min-[900px]:mt-1 min-[900px]:flex min-[900px]:items-center min-[900px]:gap-1 min-[900px]:text-[11px]"
              : "mt-1 flex items-center gap-1 text-[12px] text-white/90"
          }
        >
          <Icon name="pin" size={compact ? 13 : 13} className={compact ? "hidden text-white min-[900px]:inline" : "text-white"} />{" "}
          {location}
        </p>
      </div>
    </div>
  );

  if (!showButton) {
    return (
      <Link href={`/du-an/${slug}`} className="rounded-lg overflow-hidden block">
        {media}
      </Link>
    );
  }

  return (
    <Link href={`/du-an/${slug}`} className="block overflow-hidden rounded-lg border border-[#EDEBEA] bg-white">
      {media}
      <div className="p-1 min-[900px]:p-3">
        <span className="inline-flex items-center gap-[6px] rounded-md bg-white px-[10px] py-1 text-[11px] font-semibold text-[#0C0D0D] ring-1 ring-inset ring-[#E4E1E0] min-[900px]:px-[14px] min-[900px]:py-2 min-[900px]:text-[12px]">
          Xem chi tiết <Icon name="arrow-right" size={12} className="min-[900px]:!h-[13px] min-[900px]:!w-[13px]" />
        </span>
      </div>
    </Link>
  );
}
