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
  isNew = false,
  showPhotoCount = false,
}: {
  listing: PropertyListing;
  /** Home's 3-col mobile grid is short/wide; the detail page's "related" strip is taller, per master. */
  mobileAspect?: string;
  desktopAspect?: string;
  /** USER_APPROVED_PREMIUM_WIDE_SCALE section 11: >=1440px aspect ratio, separate from desktopAspect so the 900-1439px tier doesn't shift. Falls back to desktopAspect when unset. */
  wideAspect?: string;
  /** Route-specific demo-asset slot (Round 8 asset map) — falls back to listing.media[0] when unset. */
  imageOverride?: string;
  /** "Hàng Mới Lên" (/cho-thue) only — a red "Mới <24H" pill. The caller
      decides (not computed here from Date.now(), which the React Compiler's
      purity check rejects inside a component body) — see ChoThuePageInner,
      where every card in that carousel is already known to qualify. */
  isNew?: boolean;
  /** Same section — a small "N ảnh" pill over the photo. No camera icon
      exists in the frozen icon set, so this is text-only rather than
      reaching for an icon that doesn't actually depict a photo count. */
  showPhotoCount?: boolean;
}) {
  const specs = [
    `${listing.area}m²`,
    listing.bedroomCount !== null ? `${listing.bedroomCount}PN` : null,
    listing.furnishingStatus,
  ].filter(Boolean);

  return (
    <Link
      href={`/cho-thue/${listing.slug}`}
      className="group block overflow-hidden rounded-lg border border-[#EDEBEA] bg-white transition-[box-shadow,transform,border-color] duration-base ease-base hover:-translate-y-1 hover:border-[#E0D6D6] hover:shadow-[0_14px_30px_-12px_rgba(12,13,13,0.22)] active:scale-[0.98] active:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#880206] motion-reduce:transform-none wide:shadow-v2-premium wide:hover:shadow-v2-premium-hover"
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
        <span className="absolute left-[10px] top-[10px] rounded-full border border-white/20 bg-black/60 px-[10px] py-1 text-[11px] font-medium text-white backdrop-blur-[4px] transition-all duration-base ease-base group-hover:border-white/40 group-hover:bg-[#880206] wide:py-[6px] wide:text-[12px]">
          {listing.propertyType}
        </span>
        {isNew && (
          <span className="btn-primary-gradient absolute right-[10px] top-[10px] rounded-full px-[10px] py-1 text-[11px] font-bold text-white wide:py-[6px] wide:text-[12px]">
            Mới &lt;24H
          </span>
        )}
        {showPhotoCount && listing.media.length > 0 && (
          <span className="absolute bottom-[10px] left-[10px] rounded-full bg-black/55 px-[8px] py-1 text-[10px] font-medium text-white backdrop-blur-[2px] wide:text-[11px]">
            {listing.media.length} ảnh
          </span>
        )}
      </div>
      <div className="p-2 leading-tight min-[900px]:p-2 wide:p-4">
        <h3 className="line-clamp-1 text-[14px] leading-[20px] font-bold text-[#0C0D0D] transition-colors duration-fast ease-base group-hover:text-[#880206] min-[900px]:text-[13px] min-[900px]:leading-normal wide:text-[16px] wide:leading-[23px]">
          {listing.roomNo}
        </h3>
        <p className="mt-1 line-clamp-1 flex items-center gap-1 text-[11px] leading-[17px] text-[#5F5D5D] min-[900px]:mt-1 min-[900px]:text-[11px] min-[900px]:leading-normal wide:text-[13px] wide:leading-[19px]">
          <Icon name="pin" size={11} className="shrink-0 min-[900px]:!h-[11px] min-[900px]:!w-[11px] wide:!h-[13px] wide:!w-[13px]" /> {listing.location}
        </p>
        <p className="mt-1 line-clamp-1 text-[11px] leading-[17px] text-[#5F5D5D] min-[900px]:mt-1 min-[900px]:text-[11px] min-[900px]:leading-normal wide:text-[13px] wide:leading-[19px]">
          {specs.join(" • ")}
        </p>
        {/* Deliberately no larger than the room name above it. The price used
            to outrun the title at every width (18px vs 16px at >=1440, bold
            and in the brand red on top of that), so the card read as a price
            tag with a caption rather than a listing. */}
        <p className="mt-1 text-[13px] leading-[18px] font-bold text-[#880206] min-[900px]:mt-1 min-[900px]:line-clamp-1 min-[900px]:text-[13px] min-[900px]:leading-normal wide:text-[15px] wide:leading-[21px]">
          {formatCurrencyVnd(listing.price)}/tháng
        </p>
      </div>
    </Link>
  );
}
