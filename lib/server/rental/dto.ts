import type { AdminPropertyRecord, PropertyListing } from "@/lib/types";

/**
 * The one function responsible for the contract's
 * "publicNeverExposesInternalFields" rule for rentals. Physically
 * constructs a new object naming only the public fields — commission/
 * guidePerson/internalNotes/sourceId/published are never spread in, so a
 * future field added to AdminPropertyRecord can't silently leak here.
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
    propertyType: record.propertyType,
    description: record.description,
    highlights: record.highlights,
    availability: record.availability,
    media: record.media,
    bedroomCount: record.bedroomCount,
    furnishingStatus: record.furnishingStatus,
  };
}

export function toPublicPropertyListings(records: AdminPropertyRecord[]): PropertyListing[] {
  return records.filter((r) => r.published).map(toPublicPropertyListing);
}
