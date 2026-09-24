import type { Availability, PropertyType } from "@/lib/types";

export interface RawRentalRow {
  sourceRow: number;
  cells: string[];
}

export interface NormalizedRentalRecord {
  sourceId: string;
  sourceRow: number;
  sourceHash: string;

  buildingOrGroupCode: string;
  availability: Availability | null;
  availabilityRaw: string;
  location: string;
  address: string;
  mediaLink: string;
  roomNo: string;
  price: number | null;
  priceRaw: string;
  /** internal-only */
  commission: string;
  serviceFee: string;
  area: number | null;
  areaRaw: string;
  verticalAccess: string;
  propertyType: PropertyType | null;
  propertyTypeRaw: string;
  description: string;
  highlights: string[];
  /** internal-only */
  guidePerson: string;
  /** internal-only */
  internalNotes: string;
  bedroomCount: number | null;
  furnishingStatus: string | null;

  /** true if a column-shift repair was applied (e.g. a missing commission cell) */
  wasRepaired: boolean;
}

export type RentalParseOutcome =
  | { kind: "valid"; record: NormalizedRentalRecord }
  | { kind: "ignored"; sourceRow: number; reason: string }
  | { kind: "quarantined"; sourceRow: number; reason: string; raw: RawRentalRow };
