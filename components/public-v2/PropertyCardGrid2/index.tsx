import Image from "next/image";
import Link from "next/link";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";
import { formatCurrencyVnd } from "@/lib/format";
import type { PropertyListing } from "@/lib/types";

// Grid/featured card — home featured rentals (desktop 4-col / mobile 3-col)
// and the "BĐS cùng khu vực" related grid on the detail page. Matches the
// approved masters' compact grid card: photo with a status pill overlay,
// title, location, a "•"-joined specs line, then the price.
export function PropertyCardGrid2({ listing }: { listing: PropertyListing }) {
  const specs = [
    `${listing.area}m²`,
    listing.bedroomCount !== null ? `${listing.bedroomCount}PN` : null,
    listing.furnishingStatus,
  ].filter(Boolean);

  return (
    <Link
      href={`/cho-thue/${listing.slug}`}
      className="block overflow-hidden rounded-lg border border-[#EDEBEA] bg-white transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
    >
      <div className="relative aspect-[2/1] min-[900px]:aspect-[199/115]">
        <Image src={listing.media[0]} alt={listing.roomNo} fill className="object-cover" unoptimized />
        <span className="absolute left-[10px] top-[10px] rounded-full bg-black/55 px-[10px] py-1 text-[11px] font-medium text-white">
          {listing.propertyType}
        </span>
      </div>
      <div className="p-1 leading-tight min-[900px]:p-2">
        <h3 className="line-clamp-1 text-[9px] font-bold text-[#0C0D0D] min-[900px]:text-[13px]">
          {listing.roomNo}
        </h3>
        <p className="mt-[1px] line-clamp-1 flex items-center gap-1 text-[7px] text-[#5F5D5D] min-[900px]:mt-1 min-[900px]:text-[11px]">
          <Icon name="pin" size={7} className="shrink-0 min-[900px]:!h-[11px] min-[900px]:!w-[11px]" /> {listing.location}
        </p>
        <p className="mt-[1px] line-clamp-1 text-[7px] text-[#5F5D5D] min-[900px]:mt-1 min-[900px]:text-[11px]">{specs.join(" • ")}</p>
        <p className="mt-[1px] line-clamp-1 text-[9px] font-bold text-[#880206] min-[900px]:mt-1 min-[900px]:text-[14px]">
          {formatCurrencyVnd(listing.price)}/tháng
        </p>
      </div>
    </Link>
  );
}
