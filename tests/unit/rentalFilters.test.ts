import { describe, it, expect } from "vitest";
import { properties } from "@/lib/data/properties";
import {
  EMPTY_RENTAL_FILTERS,
  filterProperties,
  hasActiveRentalFilters,
  matchesQuery,
  rentalFiltersFromParams,
  rentalFiltersToParams,
  sortProperties,
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

  // Supersedes "never invents a bedroom-count filter field". That rule
  // existed because PropertyListing had no bedroom data at the time, so the
  // sidebar's "Số phòng ngủ" group was wired to local state and silently
  // filtered nothing. bedroomCount is now a real, admin-editable field, so
  // the group filters for real — and these lock in that it never guesses.
  describe("bedroom filter", () => {
    const withBedrooms = [
      { ...properties[0], slug: "b-null", bedroomCount: null },
      { ...properties[0], slug: "b-1", bedroomCount: 1 },
      { ...properties[0], slug: "b-2", bedroomCount: 2 },
      { ...properties[0], slug: "b-5", bedroomCount: 5 },
    ];

    it("treats the value as a minimum", () => {
      const result = filterProperties(withBedrooms, { ...EMPTY_RENTAL_FILTERS, bedrooms: 2 });
      expect(result.map((p) => p.slug)).toEqual(["b-2", "b-5"]);
    });

    it("excludes listings whose bedroom count is unknown", () => {
      const result = filterProperties(withBedrooms, { ...EMPTY_RENTAL_FILTERS, bedrooms: 1 });
      expect(result.some((p) => p.slug === "b-null")).toBe(false);
    });

    it("keeps every listing, unknown included, when no bedroom filter is set", () => {
      const result = filterProperties(withBedrooms, EMPTY_RENTAL_FILTERS);
      expect(result).toHaveLength(4);
    });

    it("counts as an active filter", () => {
      expect(hasActiveRentalFilters({ ...EMPTY_RENTAL_FILTERS, bedrooms: 2 })).toBe(true);
      expect(hasActiveRentalFilters(EMPTY_RENTAL_FILTERS)).toBe(false);
    });
  });

  describe("sort", () => {
    const unsorted = [
      { ...properties[0], slug: "mid", price: 20_000_000, area: 50 },
      { ...properties[0], slug: "low", price: 5_000_000, area: 200 },
      { ...properties[0], slug: "high", price: 40_000_000, area: 10 },
    ];

    it("leaves source order untouched by default and does not mutate the input", () => {
      const result = sortProperties(unsorted, "default");
      expect(result.map((p) => p.slug)).toEqual(["mid", "low", "high"]);
      expect(unsorted.map((p) => p.slug)).toEqual(["mid", "low", "high"]);
    });

    it("orders by price both ways and by area descending", () => {
      expect(sortProperties(unsorted, "price-asc").map((p) => p.slug)).toEqual(["low", "mid", "high"]);
      expect(sortProperties(unsorted, "price-desc").map((p) => p.slug)).toEqual(["high", "mid", "low"]);
      expect(sortProperties(unsorted, "area-desc").map((p) => p.slug)).toEqual(["low", "mid", "high"]);
      // Still non-mutating after every branch.
      expect(unsorted.map((p) => p.slug)).toEqual(["mid", "low", "high"]);
    });
  });
});

describe("URL param round-trip and malformed input", () => {
  it("round-trips bedrooms and sort", () => {
    const params = rentalFiltersToParams({ ...EMPTY_RENTAL_FILTERS, bedrooms: 3, sort: "price-desc" }, 1);
    expect(params.get("pn")).toBe("3");
    expect(params.get("sort")).toBe("price-desc");
    const { filters } = rentalFiltersFromParams(params);
    expect(filters.bedrooms).toBe(3);
    expect(filters.sort).toBe("price-desc");
  });

  it("omits the default sort from the URL", () => {
    const params = rentalFiltersToParams(EMPTY_RENTAL_FILTERS, 1);
    expect(params.has("sort")).toBe(false);
    expect(params.has("pn")).toBe(false);
  });

  // A hand-edited or stale link must degrade to "no narrowing", not to a
  // filter that silently matches nothing and looks like an empty database.
  it("drops an unknown property type instead of filtering everything out", () => {
    const { filters } = rentalFiltersFromParams(new URLSearchParams("type=Biệt%20thự"));
    expect(filters.propertyType).toBe("");
  });

  it("drops an unknown sort value", () => {
    const { filters } = rentalFiltersFromParams(new URLSearchParams("sort=random"));
    expect(filters.sort).toBe("default");
  });

  it("drops a non-numeric or out-of-range bedroom value", () => {
    expect(rentalFiltersFromParams(new URLSearchParams("pn=abc")).filters.bedrooms).toBeNull();
    expect(rentalFiltersFromParams(new URLSearchParams("pn=0")).filters.bedrooms).toBeNull();
    expect(rentalFiltersFromParams(new URLSearchParams("pn=-3")).filters.bedrooms).toBeNull();
    expect(rentalFiltersFromParams(new URLSearchParams("pn=999")).filters.bedrooms).toBeNull();
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
      { ...EMPTY_RENTAL_FILTERS, q: "studio", location: "", propertyType: "Studio" },
      1,
    );
    expect(params.get("q")).toBe("studio");
    expect(params.get("type")).toBe("Studio");
    expect(params.has("location")).toBe(false);
    expect(params.has("page")).toBe(false);
  });

  it("round-trips filters and page through params", () => {
    const filters = { ...EMPTY_RENTAL_FILTERS, q: "vp", location: "Hà Nội", propertyType: "Văn phòng" as const, priceRange: "10-20tr", areaRange: "50-100" };
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
