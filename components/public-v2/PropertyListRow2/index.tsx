import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons";
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
    <div className="overflow-hidden rounded-lg border border-[#EDEBEA] bg-white min-[900px]:flex min-[900px]:gap-5 min-[900px]:overflow-visible min-[900px]:border-0 min-[900px]:border-b min-[900px]:border-[#EDEBEA] min-[900px]:pb-5">
      <div className="relative aspect-[16/10] min-[900px]:aspect-[4/3] min-[900px]:w-[260px] min-[900px]:shrink-0 min-[900px]:overflow-hidden min-[900px]:rounded-lg">
        <Image src={listing.media[0]} alt={listing.roomNo} fill className="object-cover" unoptimized />
        <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white min-[900px]:hidden">
          {listing.propertyType}
        </span>
        <button
          type="button"
          aria-label="Yêu thích"
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#880206] min-[900px]:hidden"
        >
          <Icon name="heart" size={16} />
        </button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 min-[900px]:p-0">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/cho-thue/${listing.slug}`} className="text-[16px] font-bold text-[#0C0D0D] hover:text-[#880206]">
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
        <p className="mt-1.5 flex items-center gap-1 text-[13px] text-[#5F5D5D]">
          <Icon name="pin" size={14} /> {listing.location}
        </p>
        <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[#5F5D5D]">
          <Icon name="area" size={14} /> {specs.join(" • ")}
        </p>
        <div className="mt-3 flex flex-1 items-end gap-3">
          <p className="min-w-0 flex-1 text-[18px] font-bold text-[#880206]">{formatCurrencyVnd(listing.price)}/tháng</p>
          <Link
            href={`/cho-thue/${listing.slug}`}
            className="hidden shrink-0 rounded-md border border-[#880206] px-4 py-2 text-[13px] font-semibold text-[#880206] hover:bg-[#F7F6F6] min-[900px]:block"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}
