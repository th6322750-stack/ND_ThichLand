import { describe, it, expect } from "vitest";
import { properties } from "@/lib/data/properties";
import {
  EMPTY_RENTAL_FILTERS,
  filterProperties,
  hasActiveRentalFilters,
  matchesQuery,
  rentalFiltersFromParams,
  rentalFiltersToParams,
} from "@/lib/rentalFilters";

describe("matchesQuery / filterProperties", () => {
  it("matches by room number, location, address, type, description, and highlights", () => {
    expect(matchesQuery(properties[0], "P.301")).toBe(true);
    expect(matchesQuery(properties[0], "nội thất đầy đủ")).toBe(true);
    expect(matchesQuery(properties[0], "khong-ton-tai-xyz")).toBe(false);
  });

  it("is case- and diacritic-position independent for a direct substring", () => {
    expect(matchesQuery(properties[0], "studio")).toBe(false);
    expect(matchesQuery(properties[1], "STUDIO")).toBe(true);
  });

  it("filters by property type", () => {
    const result = filterProperties(properties, { ...EMPTY_RENTAL_FILTERS, propertyType: "Studio" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.propertyType === "Studio")).toBe(true);
  });

  it("filters by price range using half-open bounds", () => {
    const result = filterProperties(properties, { ...EMPTY_RENTAL_FILTERS, priceRange: "duoi-10tr" });
    expect(result.every((p) => p.price < 10_000_000)).toBe(true);
  });

  it("filters by area range", () => {
    const result = filterProperties(properties, { ...EMPTY_RENTAL_FILTERS, areaRange: "tren-200" });
    expect(result.every((p) => p.area >= 200)).toBe(true);
  });

  it("combines text search with structured filters", () => {
    const result = filterProperties(properties, {
      ...EMPTY_RENTAL_FILTERS,
      q: "văn phòng",
      propertyType: "Văn phòng",
    });
    expect(result.every((p) => p.propertyType === "Văn phòng")).toBe(true);
  });

  it("returns no results for a query that matches nothing", () => {
    const result = filterProperties(properties, { ...EMPTY_RENTAL_FILTERS, q: "khong-ton-tai-xyz" });
    expect(result).toHaveLength(0);
  });

  it("never invents a bedroom-count filter field", () => {
    expect(EMPTY_RENTAL_FILTERS).not.toHaveProperty("bedroom");
    expect(EMPTY_RENTAL_FILTERS).not.toHaveProperty("bedrooms");
  });
});

describe("hasActiveRentalFilters", () => {
  it("is false for the empty state", () => {
    expect(hasActiveRentalFilters(EMPTY_RENTAL_FILTERS)).toBe(false);
  });

  it("is true when any field is set", () => {
    expect(hasActiveRentalFilters({ ...EMPTY_RENTAL_FILTERS, q: "abc" })).toBe(true);
    expect(hasActiveRentalFilters({ ...EMPTY_RENTAL_FILTERS, location: "Hà Nội" })).toBe(true);
  });
});

describe("URL param round-trip", () => {
  it("serializes only non-empty fields and omits page=1", () => {
    const params = rentalFiltersToParams(
      { q: "studio", location: "", propertyType: "Studio", priceRange: "", areaRange: "" },
      1,
    );
    expect(params.get("q")).toBe("studio");
    expect(params.get("type")).toBe("Studio");
    expect(params.has("location")).toBe(false);
    expect(params.has("page")).toBe(false);
  });

  it("round-trips filters and page through params", () => {
    const filters = { q: "vp", location: "Hà Nội", propertyType: "Văn phòng" as const, priceRange: "10-20tr", areaRange: "50-100" };
    const params = rentalFiltersToParams(filters, 3);
    const parsed = rentalFiltersFromParams(params);
    expect(parsed.filters).toEqual(filters);
    expect(parsed.page).toBe(3);
  });

  it("defaults to page 1 and empty filters when params are absent", () => {
    const parsed = rentalFiltersFromParams(new URLSearchParams());
    expect(parsed.filters).toEqual(EMPTY_RENTAL_FILTERS);
    expect(parsed.page).toBe(1);
  });
});
