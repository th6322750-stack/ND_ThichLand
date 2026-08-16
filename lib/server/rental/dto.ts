import type { AdminPropertyRecord, PropertyListing } from "@/lib/types";

/**
 * The one function responsible for the contract's
 * "publicNeverExposesInternalFields" rule for rentals. Physically
 * constructs a new object naming only the public fields — commission/
 * guidePerson/internalNotes/sourceId/published are never spread in, so a
 * future field added to AdminPropertyRecord can't silently leak here.
 *
 * Only ever called on an already-published record (see
 * toPublicPropertyListings) — lib/server/rental/merge.ts's
 * isEligibleToPublish() guarantees published:true implies propertyType and
 * availability are both non-null, so the assertions below don't hide a
 * real "unknown" value from ever reaching a public consumer.
 */
export function toPublicPropertyListing(record: AdminPropertyRecord): PropertyListing {
  return {
    slug: record.slug,
    roomNo: record.roomNo,
    location: record.location,
    address: record.address,
    price: record.price,
    serviceFee: record.serviceFee,
    area: record.area,
    verticalAccess: record.verticalAccess,
    propertyType: record.propertyType!,
    description: record.description,
    highlights: record.highlights,
    availability: record.availability!,
    media: record.media,
    bedroomCount: record.bedroomCount,
    furnishingStatus: record.furnishingStatus,
    bathroomCount: record.bathroomCount,
    amenities: record.amenities,
    locationNote: record.locationNote,
    videoUrl: record.videoUrl,
  };
}

export function toPublicPropertyListings(records: AdminPropertyRecord[]): PropertyListing[] {
  return records.filter((r) => r.published).map(toPublicPropertyListing);
}
