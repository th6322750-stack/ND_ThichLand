import Image from "next/image";
import Link from "next/link";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";
import { formatCurrencyVnd } from "@/lib/format";
import type { PropertyListing } from "@/lib/types";

// /cho-thue result row — matches the approved masters exactly: a stacked
// full-bleed photo card with heart/status overlays on mobile
// (02_ChoThue_MOBILE.png), a horizontal photo-left/info-right row with a
// "Xem chi tiết" button on desktop (02_ChoThue_WEB.png). Favorite is a
// visual-only affordance — no persistence, per the freeze package's
// interaction rules (no new backend workflow without separate approval).
export function PropertyListRow2({ listing }: { listing: PropertyListing }) {
  const specs = [
    `${listing.area}m²`,
    listing.bedroomCount !== null ? `${listing.bedroomCount} PN` : null,
    listing.furnishingStatus,
  ].filter(Boolean);

  return (
    <div className="overflow-hidden rounded-lg border border-[#EDEBEA] bg-white min-[900px]:flex min-[900px]:gap-4 min-[900px]:overflow-visible min-[900px]:border-0 min-[900px]:border-b min-[900px]:border-[#EDEBEA] min-[900px]:pb-3 wide:gap-6 wide:pb-5">
      {/* Master mobile row is a short, wide banner photo (~684x200, ~3.4:1)
          — the old 16:10 (near-square) crop was the main reason only ~2.5
          cards fit the canonical viewport where master shows ~5. */}
      <div className="relative aspect-[16/4.2] min-[900px]:aspect-[3/2] min-[900px]:w-[220px] min-[900px]:shrink-0 min-[900px]:overflow-hidden min-[900px]:rounded-lg wide:w-[260px] wide:rounded-[14px]">
        <Image src={listing.media[0]} alt={listing.roomNo} fill className="object-cover" unoptimized />
        <span className="absolute bottom-1 left-1 rounded-full bg-black/55 px-2 py-[2px] text-[9px] font-medium text-white min-[900px]:hidden">
          {listing.propertyType}
        </span>
        <button
          type="button"
          aria-label="Yêu thích"
          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#880206] min-[900px]:hidden"
        >
          <Icon name="heart" size={12} />
        </button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-2 min-[900px]:p-0">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/cho-thue/${listing.slug}`}
            className="text-[11px] font-bold text-[#0C0D0D] hover:text-[#880206] min-[900px]:text-[16px] wide:text-[18px]"
          >
            {listing.roomNo}
          </Link>
          <button
            type="button"
            aria-label="Yêu thích"
            className="hidden shrink-0 items-center justify-center text-[#880206] min-[900px]:flex"
          >
            <Icon name="heart" size={20} />
          </button>
        </div>
        <p className="mt-[2px] flex items-center gap-1 text-[9px] text-[#5F5D5D] min-[900px]:mt-1 min-[900px]:text-[12px] wide:text-[13px]">
          <Icon name="pin" size={9} className="min-[900px]:!h-3 min-[900px]:!w-3" /> {listing.location}
        </p>
        <p className="mt-[2px] flex items-center gap-1 text-[9px] text-[#5F5D5D] min-[900px]:mt-1 min-[900px]:gap-1 min-[900px]:text-[12px] wide:text-[13px]">
          <Icon name="area" size={9} className="min-[900px]:!h-3 min-[900px]:!w-3" /> {specs.join(" • ")}
        </p>
        <div className="mt-[3px] flex flex-1 items-end gap-3 min-[900px]:mt-2">
          <p className="min-w-0 flex-1 text-[12px] font-bold text-[#880206] min-[900px]:text-[18px] wide:text-v2-price">
            {formatCurrencyVnd(listing.price)}/tháng
          </p>
          <Link
            href={`/cho-thue/${listing.slug}`}
            className="hidden shrink-0 rounded-md border border-[#880206] px-4 py-2 text-[13px] font-semibold text-[#880206] hover:bg-[#F7F6F6] min-[900px]:block wide:h-[44px] wide:px-5 wide:py-0 wide:text-[14px] wide:leading-[42px]"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}
