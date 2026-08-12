import Image from "next/image";
import Link from "next/link";
import type { PropertyListing } from "@/lib/types";
import { formatArea, formatCurrencyVnd } from "@/lib/format";
import { Icon } from "@/components/icons";

type PropertyCardState = "default" | "hover" | "unavailable" | "loading";

interface PropertyCardProps {
  listing: PropertyListing;
  state?: PropertyCardState;
}

const AVAILABILITY_STYLES: Record<PropertyListing["availability"], string> = {
  "Còn trống": "bg-success text-surface",
  "Sắp trống": "bg-gold text-surface",
  "Đã cho thuê": "bg-[#ECE8E6] text-[#8A857F]",
};

export function PropertyCard({ listing, state = "default" }: PropertyCardProps) {
  if (state === "loading") {
    return (
      <div className="animate-pulse overflow-hidden rounded-md border border-line bg-surface">
        <div className="aspect-[4/3] bg-soft" />
        <div className="space-y-2 p-4">
          <div className="h-4 w-3/4 rounded bg-soft" />
          <div className="h-3 w-1/2 rounded bg-soft" />
        </div>
      </div>
    );
  }

  const unavailable = state === "unavailable" || listing.availability === "Đã cho thuê";

  return (
    <Link
      href={`/cho-thue/${listing.slug}`}
      className={`group block overflow-hidden rounded-md border border-line bg-surface transition-colors duration-fast hover:border-primary ${
        unavailable ? "opacity-70" : ""
      }`}
    >
      <div className="relative aspect-[4/3]">
        <Image
          src={listing.media[0]}
          alt={listing.roomNo}
          fill
          className="object-cover"
          unoptimized
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-label ${AVAILABILITY_STYLES[listing.availability]}`}
        >
          {listing.availability}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-h3 text-ink">{listing.description.split(",")[0] || listing.roomNo}</h3>
        <p className="mt-1 text-body text-muted">
          {listing.location} • khu vực theo dữ liệu Sheet
        </p>
        <div className="mt-3 flex items-center gap-4 text-body text-body">
          <span className="inline-flex items-center gap-1">
            <Icon name="area" size={16} /> {formatArea(listing.area)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="home" size={16} /> {listing.propertyType}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-line pt-3">
          <span className="whitespace-nowrap text-price text-primary">
            {formatCurrencyVnd(listing.price)}/tháng
          </span>
          <span className="whitespace-nowrap text-label text-primary group-hover:underline">
            Xem chi tiết
          </span>
        </div>
      </div>
    </Link>
  );
}
