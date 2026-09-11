import type { PropertyListing, PropertyType } from "./types";

/**
 * Result ordering offered on /cho-thue. "default" is the source order (the
 * order rows come out of the Sheet/CMS) — deliberately NOT labelled "mới
 * nhất": PropertyListing has no publish/created date, so calling source
 * order "newest" would assert an ordering fact the data doesn't carry.
 */
export type RentalSort = "default" | "price-asc" | "price-desc" | "area-desc";

export const RENTAL_SORT_OPTIONS: { value: RentalSort; label: string }[] = [
  { value: "default", label: "Mặc định" },
  { value: "price-asc", label: "Giá thấp → cao" },
  { value: "price-desc", label: "Giá cao → thấp" },
  { value: "area-desc", label: "Diện tích lớn → nhỏ" },
];

export interface RentalFilterState {
  q: string;
  location: string;
  propertyType: PropertyType | "";
  /**
   * Minimum bedroom count, or null for "any". Backed by the real
   * PropertyListing.bedroomCount field — before this existed the sidebar's
   * "Số phòng ngủ" group was wired to local component state and silently
   * never filtered anything.
   */
  bedrooms: number | null;
  sort: RentalSort;
  /** @deprecated bucket-id form, still read by the pre-PHA2 components/public/Filter (out of PHA2 scope) — new UI uses priceMin/priceMax. */
  priceRange: string;
  /** @deprecated bucket-id form, still read by the pre-PHA2 components/public/Filter (out of PHA2 scope) — new UI uses areaMin/areaMax. */
  areaRange: string;
  // PHA3 round 1: continuous Từ/Đến range, adapted onto the same authoritative
  // `price`/`area` fields the old bucket selects already checked — null means
  // "no bound on this side" (e.g. priceMax: null == the master's "Trên 50 triệu").
  priceMin: number | null;
  priceMax: number | null;
  areaMin: number | null;
  areaMax: number | null;
}

export const EMPTY_RENTAL_FILTERS: RentalFilterState = {
  q: "",
  location: "",
  propertyType: "",
  bedrooms: null,
  sort: "default",
  priceRange: "",
  areaRange: "",
  priceMin: null,
  priceMax: null,
  areaMin: null,
  areaMax: null,
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
    if (filters.priceMin !== null && p.price < filters.priceMin) return false;
    if (filters.priceMax !== null && p.price > filters.priceMax) return false;
    if (filters.areaMin !== null && p.area < filters.areaMin) return false;
    if (filters.areaMax !== null && p.area > filters.areaMax) return false;
    // A listing whose bedroom count is unknown (null) is NOT treated as a
    // match — the same "unknown is not a plausible default" rule the rest of
    // the data layer follows. Showing it under "2 phòng" would assert a fact
    // the record doesn't have.
    if (filters.bedrooms !== null && (p.bedroomCount === null || p.bedroomCount < filters.bedrooms)) return false;
    return true;
  });
}

/** Pure, stable ordering — never mutates the input array. */
export function sortProperties(properties: PropertyListing[], sort: RentalSort): PropertyListing[] {
  if (sort === "default") return properties;
  const copy = [...properties];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "area-desc":
      return copy.sort((a, b) => b.area - a.area);
  }
}

export function hasActiveRentalFilters(filters: RentalFilterState): boolean {
  return Boolean(
    filters.q ||
      filters.location ||
      filters.propertyType ||
      filters.priceRange ||
      filters.areaRange ||
      filters.priceMin !== null ||
      filters.priceMax !== null ||
      filters.areaMin !== null ||
      filters.areaMax !== null ||
      filters.bedrooms !== null,
  );
}

const PARAM_KEYS = {
  q: "q",
  location: "location",
  propertyType: "type",
  bedrooms: "pn",
  sort: "sort",
  priceRange: "price",
  areaRange: "area",
  priceMin: "priceMin",
  priceMax: "priceMax",
  areaMin: "areaMin",
  areaMax: "areaMax",
  page: "page",
} as const;

export function rentalFiltersToParams(filters: RentalFilterState, page: number): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set(PARAM_KEYS.q, filters.q);
  if (filters.location) params.set(PARAM_KEYS.location, filters.location);
  if (filters.propertyType) params.set(PARAM_KEYS.propertyType, filters.propertyType);
  if (filters.bedrooms !== null) params.set(PARAM_KEYS.bedrooms, String(filters.bedrooms));
  if (filters.sort !== "default") params.set(PARAM_KEYS.sort, filters.sort);
  if (filters.priceRange) params.set(PARAM_KEYS.priceRange, filters.priceRange);
  if (filters.areaRange) params.set(PARAM_KEYS.areaRange, filters.areaRange);
  if (filters.priceMin !== null) params.set(PARAM_KEYS.priceMin, String(filters.priceMin));
  if (filters.priceMax !== null) params.set(PARAM_KEYS.priceMax, String(filters.priceMax));
  if (filters.areaMin !== null) params.set(PARAM_KEYS.areaMin, String(filters.areaMin));
  if (filters.areaMax !== null) params.set(PARAM_KEYS.areaMax, String(filters.areaMax));
  if (page > 1) params.set(PARAM_KEYS.page, String(page));
  return params;
}

function parseOptionalNumber(raw: string | null): number | null {
  if (raw === null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

const KNOWN_PROPERTY_TYPES: PropertyType[] = ["Căn hộ", "Nhà", "Mặt bằng", "Văn phòng", "Xưởng", "Studio"];

/** A hand-edited/stale `?type=` value degrades to "no type filter" rather than
    silently matching nothing and looking like an empty database. */
function parsePropertyTypeParam(raw: string | null): PropertyType | "" {
  if (!raw) return "";
  return (KNOWN_PROPERTY_TYPES as string[]).includes(raw) ? (raw as PropertyType) : "";
}

function parseSortParam(raw: string | null): RentalSort {
  return RENTAL_SORT_OPTIONS.some((o) => o.value === raw) ? (raw as RentalSort) : "default";
}

function parseBedroomsParam(raw: string | null): number | null {
  const n = parseOptionalNumber(raw);
  if (n === null) return null;
  const rounded = Math.floor(n);
  return rounded >= 1 && rounded <= 20 ? rounded : null;
}

export function rentalFiltersFromParams(
  params: URLSearchParams,
): { filters: RentalFilterState; page: number } {
  return {
    filters: {
      q: params.get(PARAM_KEYS.q) ?? "",
      location: params.get(PARAM_KEYS.location) ?? "",
      propertyType: parsePropertyTypeParam(params.get(PARAM_KEYS.propertyType)),
      bedrooms: parseBedroomsParam(params.get(PARAM_KEYS.bedrooms)),
      sort: parseSortParam(params.get(PARAM_KEYS.sort)),
      priceRange: params.get(PARAM_KEYS.priceRange) ?? "",
      areaRange: params.get(PARAM_KEYS.areaRange) ?? "",
      priceMin: parseOptionalNumber(params.get(PARAM_KEYS.priceMin)),
      priceMax: parseOptionalNumber(params.get(PARAM_KEYS.priceMax)),
      areaMin: parseOptionalNumber(params.get(PARAM_KEYS.areaMin)),
      areaMax: parseOptionalNumber(params.get(PARAM_KEYS.areaMax)),
    },
    page: Math.max(1, Number(params.get(PARAM_KEYS.page)) || 1),
  };
}
