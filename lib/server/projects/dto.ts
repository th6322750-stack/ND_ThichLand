import type { ProjectListing } from "@/lib/types";
import type { ProjectRecord } from "./repository";

export function toPublicProjectListing(record: ProjectRecord): ProjectListing {
  return {
    slug: record.slug,
    name: record.name,
    location: record.location,
    investor: record.investor,
    status: record.status,
    media: record.media,
    summary: record.summary,
    amenities: record.amenities,
    progressText: record.progressText,
    progressPercent: record.progressPercent,
    progressPhotos: record.progressPhotos,
    unitTypes: record.unitTypes,
    propertyType: record.propertyType,
    scale: record.scale,
    unitCount: record.unitCount,
    highlights: record.highlights,
  };
}

export function toPublicProjectListings(records: ProjectRecord[]): ProjectListing[] {
  return records.filter((r) => r.published).map(toPublicProjectListing);
}
