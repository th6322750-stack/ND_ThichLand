import Image from "next/image";
import Link from "next/link";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";
import { SaveListingButton } from "@/components/public-v2/SaveListingButton";
import { formatCurrencyVnd } from "@/lib/format";
import { firstMedia, PROPERTY_PLACEHOLDER } from "@/lib/media";
import { getZaloHref } from "@/lib/zalo";
import type { PropertyListing } from "@/lib/types";

// /cho-thue result row. Desktop (900px+) matches the approved masters
// exactly: a horizontal photo-left/info-right row with a "Xem chi tiết"
// button (02_ChoThue_WEB.png) — unchanged. MOBILE was restyled after
// client feedback ("bè bè", flat/lifeless) referencing
// KieuQuangLadipage/src/components/ListingCard.tsx's vertical card:
// taller photo, price+specs promoted to the top of the content block
// (was buried at the bottom), and two real action buttons (Xem chi tiết
// + Nhắn Zalo) instead of no call-to-action at all on the list card.
// Favorite now really saves: still no server-side workflow (the freeze
// package forbids inventing one), but the state lives in the visitor's own
// browser via lib/useSavedListings.ts and drives the "Yêu thích" tab in the
// mobile bottom nav — it used to be a button that looked interactive and did
// nothing at all.
export function PropertyListRow2({ listing }: { listing: PropertyListing }) {
  const specs = [
    `${listing.area}m²`,
    listing.bedroomCount !== null ? `${listing.bedroomCount} PN` : null,
    listing.furnishingStatus,
  ].filter(Boolean);

  return (
    <div className="overflow-hidden rounded-xl border border-[#EDEBEA] bg-white transition-shadow hover:shadow-[0_16px_32px_-20px_rgba(12,13,13,0.25)] min-[900px]:flex min-[900px]:gap-4 min-[900px]:overflow-visible min-[900px]:rounded-none min-[900px]:border-0 min-[900px]:border-b min-[900px]:border-[#EDEBEA] min-[900px]:pb-3 min-[900px]:shadow-none min-[900px]:hover:shadow-none wide:gap-6 wide:pb-5">
      <div className="relative aspect-[16/10] min-[900px]:aspect-[3/2] min-[900px]:w-[220px] min-[900px]:shrink-0 min-[900px]:overflow-hidden min-[900px]:rounded-lg wide:w-[260px] wide:rounded-[14px]">
        <Image
          src={firstMedia(listing.media, PROPERTY_PLACEHOLDER)}
          alt={listing.roomNo}
          fill
          className="object-cover"
          unoptimized
        />
        <span className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white min-[900px]:hidden">
          {listing.propertyType}
        </span>
        <SaveListingButton
          slug={listing.slug}
          size={15}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full min-[900px]:hidden"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3 min-[900px]:p-0">
        {/* Price + specs promoted to the top on mobile, baseline-aligned
            like the reference card — price is the thing a renter scans
            for first, not buried below 3 other lines. */}
        <div className="flex items-baseline justify-between gap-2 min-[900px]:hidden">
          <p className="min-w-0 truncate text-[17px] font-extrabold text-[#880206]">{formatCurrencyVnd(listing.price)}/tháng</p>
          <p className="shrink-0 whitespace-nowrap text-[12px] font-semibold text-[#3A3838]">{specs.join(" • ")}</p>
        </div>

        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/cho-thue/${listing.slug}`}
            className="mt-2 line-clamp-2 text-[14px] font-bold leading-snug text-[#0C0D0D] hover:text-[#880206] min-[900px]:mt-0 min-[900px]:text-[16px] wide:text-[18px]"
          >
            {listing.roomNo}
          </Link>
          <SaveListingButton
            slug={listing.slug}
            size={20}
            idleClassName="bg-transparent text-[#880206]"
            savedClassName="bg-[#880206] text-white"
            className="hidden h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full min-[900px]:flex"
          />
        </div>
        <p className="mt-1 flex items-center gap-1 text-[12px] text-[#5F5D5D] min-[900px]:mt-1 min-[900px]:text-[12px] wide:text-[13px]">
          <Icon name="pin" size={12} className="shrink-0 min-[900px]:!h-3 min-[900px]:!w-3" /> {listing.location}
        </p>
        <p className="mt-1 hidden items-center gap-1 text-[9px] text-[#5F5D5D] min-[900px]:mt-1 min-[900px]:flex min-[900px]:gap-1 min-[900px]:text-[12px] wide:text-[13px]">
          <Icon name="area" size={9} className="min-[900px]:!h-3 min-[900px]:!w-3" /> {specs.join(" • ")}
        </p>
        <div className="mt-[3px] hidden flex-1 items-end gap-3 min-[900px]:flex min-[900px]:mt-2">
          <p className="min-w-0 flex-1 text-[18px] font-bold text-[#880206] wide:text-v2-price">
            {formatCurrencyVnd(listing.price)}/tháng
          </p>
          <Link
            href={`/cho-thue/${listing.slug}`}
            className="shrink-0 rounded-md border border-[#880206] px-4 py-2 text-[13px] font-semibold text-[#880206] hover:bg-[#F7F6F6] wide:h-[44px] wide:px-5 wide:py-0 wide:text-[14px] wide:leading-[42px]"
          >
            Xem chi tiết
          </Link>
        </div>

        {/* Mobile-only footer actions — client feedback wanted a real
            call-to-action pair on the list card itself, matching the
            reference's "Xem chi tiết" + "Nhắn Zalo" row. */}
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#EDEBEA] pt-3 min-[900px]:hidden">
          <Link
            href={`/cho-thue/${listing.slug}`}
            className="flex min-h-[40px] items-center justify-center rounded-lg border border-[#E4E1E0] px-2 text-[13px] font-bold text-[#0C0D0D] hover:border-[#880206]"
          >
            Xem chi tiết
          </Link>
          <a
            href={getZaloHref()}
            className="flex min-h-[40px] items-center justify-center gap-1 rounded-lg bg-[#0C0D0D] px-2 text-[13px] font-bold text-white hover:bg-[#2A2A2A]"
          >
            <Icon name="chat" size={15} className="text-white" /> Nhắn Zalo
          </a>
        </div>
      </div>
    </div>
  );
}
