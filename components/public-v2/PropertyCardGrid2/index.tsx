import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";
import { formatCurrencyVnd } from "@/lib/format";
import { firstMedia, PROPERTY_PLACEHOLDER } from "@/lib/media";
import type { PropertyListing } from "@/lib/types";

// Grid/featured card — home featured rentals (desktop 4-col / mobile 3-col)
// and the "BĐS cùng khu vực" related grid on the detail page. Matches the
// approved masters' compact grid card: photo with a status pill overlay,
// title, location, a "•"-joined specs line, then the price.
export function PropertyCardGrid2({
  listing,
  mobileAspect = "2/1",
  desktopAspect = "199/115",
  wideAspect,
  imageOverride,
}: {
  listing: PropertyListing;
  /** Home's 3-col mobile grid is short/wide; the detail page's "related" strip is taller, per master. */
  mobileAspect?: string;
  desktopAspect?: string;
  /** USER_APPROVED_PREMIUM_WIDE_SCALE section 11: >=1440px aspect ratio, separate from desktopAspect so the 900-1439px tier doesn't shift. Falls back to desktopAspect when unset. */
  wideAspect?: string;
  /** Route-specific demo-asset slot (Round 8 asset map) — falls back to listing.media[0] when unset. */
  imageOverride?: string;
}) {
  const specs = [
    `${listing.area}m²`,
    listing.bedroomCount !== null ? `${listing.bedroomCount}PN` : null,
    listing.furnishingStatus,
  ].filter(Boolean);

  return (
    <Link
      href={`/cho-thue/${listing.slug}`}
      className="group block overflow-hidden rounded-lg border border-[#EDEBEA] bg-white transition-shadow duration-base ease-base hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#880206] wide:shadow-v2-premium wide:hover:shadow-v2-premium-hover"
    >
      <div
        className="relative overflow-hidden aspect-[var(--mobile-aspect)] min-[900px]:aspect-[var(--desktop-aspect)] wide:aspect-[var(--wide-aspect)]"
        style={
          {
            "--mobile-aspect": mobileAspect,
            "--desktop-aspect": desktopAspect,
            "--wide-aspect": wideAspect ?? desktopAspect,
          } as CSSProperties
        }
      >
        <Image
          src={imageOverride ?? firstMedia(listing.media, PROPERTY_PLACEHOLDER)}
          alt={listing.roomNo}
          fill
          className="object-cover transition-transform duration-base ease-base group-hover:scale-[1.03] motion-reduce:transform-none"
          unoptimized
        />
        <span className="absolute left-[10px] top-[10px] rounded-full bg-black/55 px-[10px] py-1 text-[11px] font-medium text-white wide:py-[6px] wide:text-[12px]">
          {listing.propertyType}
        </span>
      </div>
      <div className="p-2 leading-tight min-[900px]:p-2 wide:p-4">
        <h3 className="line-clamp-1 text-[14px] leading-[20px] font-bold text-[#0C0D0D] min-[900px]:text-[13px] min-[900px]:leading-normal wide:text-[16px] wide:leading-[23px]">
          {listing.roomNo}
        </h3>
        <p className="mt-1 line-clamp-1 flex items-center gap-1 text-[11px] leading-[17px] text-[#5F5D5D] min-[900px]:mt-1 min-[900px]:text-[11px] min-[900px]:leading-normal wide:text-[13px] wide:leading-[19px]">
          <Icon name="pin" size={11} className="shrink-0 min-[900px]:!h-[11px] min-[900px]:!w-[11px] wide:!h-[13px] wide:!w-[13px]" /> {listing.location}
        </p>
        <p className="mt-1 line-clamp-1 text-[11px] leading-[17px] text-[#5F5D5D] min-[900px]:mt-1 min-[900px]:text-[11px] min-[900px]:leading-normal wide:text-[13px] wide:leading-[19px]">
          {specs.join(" • ")}
        </p>
        <p className="mt-1 text-[15px] leading-[20px] font-bold text-[#880206] min-[900px]:mt-1 min-[900px]:line-clamp-1 min-[900px]:text-[14px] min-[900px]:leading-normal wide:text-[18px] wide:leading-[24px]">
          {formatCurrencyVnd(listing.price)}/tháng
        </p>
      </div>
    </Link>
  );
}
