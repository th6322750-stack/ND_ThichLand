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
  /** Desktop aspect ratio (900-1439px) — /du-an's 3-col grid is ~272/292 (near-square); Home's 4-col compact row is shorter, ~199/135, per 01_TrangChu_WEB.png. */
  desktopAspect?: string;
  /** USER_APPROVED_PREMIUM_WIDE_SCALE section 10/12: >=1440px aspect ratio, separate from desktopAspect so the 900-1439px tier (already tuned against live client feedback) doesn't shift. Falls back to desktopAspect when unset. */
  wideAspect?: string;
  priority?: boolean;
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
  wideAspect,
  priority = false,
}: ProjectCardOverlay2Props) {
  const media = (
    <div
      className="group relative block aspect-[var(--mobile-aspect)] overflow-hidden min-[900px]:aspect-[var(--desktop-aspect)] wide:aspect-[var(--wide-aspect)]"
      style={
        {
          "--mobile-aspect": mobileAspect,
          "--desktop-aspect": desktopAspect,
          "--wide-aspect": wideAspect ?? desktopAspect,
        } as CSSProperties
      }
    >
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover transition-transform duration-base ease-base group-hover:scale-[1.03] motion-reduce:transform-none"
        unoptimized
        loading={priority ? "eager" : "lazy"}
      />
      {/* Client feedback: white title/location text sank into brighter
          photos (sky, light facades) — strengthened the mid-stop so there's
          real darkening behind the text without flattening the whole
          image. */}
      {/* Slightly deeper on hover so the card reads as "coming forward"
          rather than only shifting position. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-base ease-base group-hover:from-black/90 group-hover:via-black/40" />
      <div className={compact ? "absolute inset-x-0 bottom-0 p-3 min-[900px]:p-4 wide:p-[18px]" : "absolute inset-x-0 bottom-0 p-4"}>
        <h3
          className={
            compact
              ? "line-clamp-2 text-[15px] leading-[21px] font-bold text-white min-[900px]:line-clamp-1 min-[900px]:text-[18px] min-[900px]:leading-[25px] wide:text-[20px] wide:leading-[27px]"
              : "text-[16px] font-bold text-white min-[900px]:text-[17px] wide:text-[19px]"
          }
        >
          {name}
        </h3>
        <p
          className={
            compact
              ? "mt-1 flex items-center gap-1 text-[12px] leading-[18px] text-white/90 min-[900px]:mt-1 min-[900px]:text-[13px] min-[900px]:leading-[19px] wide:text-[14px] wide:leading-[20px]"
              : "mt-1 flex items-center gap-1 text-[12px] text-white/90"
          }
        >
          <Icon name="pin" size={13} className="text-white" /> {location}
        </p>
      </div>
    </div>
  );

  if (!showButton) {
    return (
      <Link
        href={`/du-an/${slug}`}
        className="block overflow-hidden rounded-lg transition-[transform,box-shadow] duration-base ease-base hover:-translate-y-1 hover:shadow-[0_16px_32px_-14px_rgba(12,13,13,0.35)] active:scale-[0.98] active:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#880206] motion-reduce:transform-none"
      >
        {media}
      </Link>
    );
  }

  return (
    <Link
      href={`/du-an/${slug}`}
      className="group/card block overflow-hidden rounded-lg border border-[#EDEBEA] bg-white transition-[transform,box-shadow] duration-base ease-base hover:-translate-y-1 hover:shadow-[0_16px_32px_-14px_rgba(12,13,13,0.28)] active:scale-[0.98] active:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#880206] motion-reduce:transform-none"
    >
      {media}
      <div className="p-1 min-[900px]:p-3">
        <span className="inline-flex items-center gap-[6px] rounded-md bg-white px-[10px] py-1 text-[11px] font-semibold text-[#0C0D0D] ring-1 ring-inset ring-[#E4E1E0] transition-colors duration-fast ease-base group-hover/card:ring-[#880206] group-hover/card:text-[#880206] min-[900px]:px-[14px] min-[900px]:py-2 min-[900px]:text-[12px]">
          Xem chi tiết <Icon name="arrow-right" size={12} className="min-[900px]:!h-[13px] min-[900px]:!w-[13px]" />
        </span>
      </div>
    </Link>
  );
}
