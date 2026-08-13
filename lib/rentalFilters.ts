import type { PropertyListing, PropertyType } from "./types";

export interface RentalFilterState {
  q: string;
  location: string;
  propertyType: PropertyType | "";
  priceRange: string;
  areaRange: string;
}

export const EMPTY_RENTAL_FILTERS: RentalFilterState = {
  q: "",
  location: "",
  propertyType: "",
  priceRange: "",
  areaRange: "",
};

interface NumericRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

// Bands over the authoritative `price`/`area` fields — not a new data field,
// just UI-level grouping so "Khoảng giá"/"Diện tích" (continuous numbers)
// can be picked from a select, matching the approved control shape.
export const PRICE_RANGES: NumericRange[] = [
  { id: "duoi-10tr", label: "Dưới 10 triệu", min: 0, max: 10_000_000 },
  { id: "10-20tr", label: "10 - 20 triệu", min: 10_000_000, max: 20_000_000 },
  { id: "20-30tr", label: "20 - 30 triệu", min: 20_000_000, max: 30_000_000 },
  { id: "tren-30tr", label: "Trên 30 triệu", min: 30_000_000, max: Infinity },
];

export const AREA_RANGES: NumericRange[] = [
  { id: "duoi-50", label: "Dưới 50m²", min: 0, max: 50 },
  { id: "50-100", label: "50 - 100m²", min: 50, max: 100 },
  { id: "100-200", label: "100 - 200m²", min: 100, max: 200 },
  { id: "tren-200", label: "Trên 200m²", min: 200, max: Infinity },
];

function inRange(value: number, range: NumericRange): boolean {
  return value >= range.min && (range.max === Infinity || value < range.max);
}

export function getLocationOptions(properties: PropertyListing[]): string[] {
  return Array.from(new Set(properties.map((p) => p.location))).sort();
}

export function getPropertyTypeOptions(properties: PropertyListing[]): PropertyType[] {
  return Array.from(new Set(properties.map((p) => p.propertyType)));
}

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFC");
}

export function matchesQuery(listing: PropertyListing, q: string): boolean {
  const needle = normalize(q.trim());
  if (!needle) return true;
  const haystacks = [
    listing.roomNo,
    listing.location,
    listing.address,
    listing.propertyType,
    listing.description,
    ...listing.highlights,
  ];
  return haystacks.some((h) => normalize(h).includes(needle));
}

export function filterProperties(
  properties: PropertyListing[],
  filters: RentalFilterState,
): PropertyListing[] {
  const priceRange = PRICE_RANGES.find((r) => r.id === filters.priceRange);
  const areaRange = AREA_RANGES.find((r) => r.id === filters.areaRange);

  return properties.filter((p) => {
    if (!matchesQuery(p, filters.q)) return false;
    if (filters.location && p.location !== filters.location) return false;
    if (filters.propertyType && p.propertyType !== filters.propertyType) return false;
    if (priceRange && !inRange(p.price, priceRange)) return false;
    if (areaRange && !inRange(p.area, areaRange)) return false;
    return true;
  });
}

export function hasActiveRentalFilters(filters: RentalFilterState): boolean {
  return Boolean(
    filters.q || filters.location || filters.propertyType || filters.priceRange || filters.areaRange,
  );
}

const PARAM_KEYS = {
  q: "q",
  location: "location",
  propertyType: "type",
  priceRange: "price",
  areaRange: "area",
  page: "page",
} as const;

export function rentalFiltersToParams(filters: RentalFilterState, page: number): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set(PARAM_KEYS.q, filters.q);
  if (filters.location) params.set(PARAM_KEYS.location, filters.location);
  if (filters.propertyType) params.set(PARAM_KEYS.propertyType, filters.propertyType);
  if (filters.priceRange) params.set(PARAM_KEYS.priceRange, filters.priceRange);
  if (filters.areaRange) params.set(PARAM_KEYS.areaRange, filters.areaRange);
  if (page > 1) params.set(PARAM_KEYS.page, String(page));
  return params;
}

export function rentalFiltersFromParams(
  params: URLSearchParams,
): { filters: RentalFilterState; page: number } {
  return {
    filters: {
      q: params.get(PARAM_KEYS.q) ?? "",
      location: params.get(PARAM_KEYS.location) ?? "",
      propertyType: (params.get(PARAM_KEYS.propertyType) as PropertyType | null) ?? "",
      priceRange: params.get(PARAM_KEYS.priceRange) ?? "",
      areaRange: params.get(PARAM_KEYS.areaRange) ?? "",
    },
    page: Math.max(1, Number(params.get(PARAM_KEYS.page)) || 1),
  };
}
