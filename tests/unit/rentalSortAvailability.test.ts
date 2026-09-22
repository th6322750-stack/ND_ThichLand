import { describe, expect, it } from "vitest";
import { isShowcasable, sortProperties, RENTAL_SORT_OPTIONS, type RentalSort } from "@/lib/rentalFilters";
import type { Availability, PropertyListing } from "@/lib/types";

function listing(slug: string, availability: Availability, price: number, area: number): PropertyListing {
  return {
    slug,
    roomNo: slug,
    location: "Hà Nội",
    address: "A",
    price,
    serviceFee: "",
    area,
    verticalAccess: "",
    propertyType: "Căn hộ",
    description: "",
    highlights: [],
    availability,
    media: [],
    bedroomCount: null,
    furnishingStatus: null,
    bathroomCount: null,
    amenities: [],
    locationNote: null,
    videoUrl: null,
    postedAt: null,
    availableFrom: null,
  };
}

const statuses = (list: PropertyListing[]) => list.map((p) => p.availability);

describe("sortProperties — availability outranks the chosen ordering", () => {
  // The client's complaint: rented rooms sat at the top purely because of
  // where they happened to fall in the sheet.
  it.each(RENTAL_SORT_OPTIONS.map((o) => o.value))("keeps let rooms at the bottom under %s", (sort) => {
    const input = [
      listing("da-thue", "Đã cho thuê", 1_000_000, 10),
      listing("sap-trong", "Sắp trống", 9_000_000, 90),
      listing("con-trong", "Còn trống", 5_000_000, 50),
    ];

    expect(statuses(sortProperties(input, sort as RentalSort))).toEqual([
      "Còn trống",
      "Sắp trống",
      "Đã cho thuê",
    ]);
  });

  it('keeps the sheet\'s own order inside a group under "Mặc định"', () => {
    const input = [
      listing("b", "Còn trống", 9_000_000, 10),
      listing("a", "Còn trống", 1_000_000, 90),
      listing("c", "Đã cho thuê", 2_000_000, 20),
    ];

    expect(sortProperties(input, "default").map((p) => p.slug)).toEqual(["b", "a", "c"]);
  });

  it("still applies the price/area ordering inside each group", () => {
    const input = [
      listing("thue-re", "Đã cho thuê", 1_000_000, 10),
      listing("trong-dat", "Còn trống", 9_000_000, 20),
      listing("trong-re", "Còn trống", 2_000_000, 80),
    ];

    expect(sortProperties(input, "price-asc").map((p) => p.slug)).toEqual([
      "trong-re",
      "trong-dat",
      "thue-re",
    ]);
    expect(sortProperties(input, "area-desc").map((p) => p.slug)).toEqual([
      "trong-re",
      "trong-dat",
      "thue-re",
    ]);
  });

  it("never mutates the array it was given", () => {
    const input = [listing("b", "Đã cho thuê", 1_000_000, 10), listing("a", "Còn trống", 2_000_000, 20)];
    const snapshot = input.map((p) => p.slug);

    sortProperties(input, "default");

    expect(input.map((p) => p.slug)).toEqual(snapshot);
  });
});

// The client, after seeing let rooms on the homepage: "còn cái nào hết phòng
// thì nó chỉ hiện bảng chung, ko hiện ở trên đầu".
describe("isShowcasable — what may appear in a promotional strip", () => {
  it("keeps rooms a visitor can actually rent", () => {
    expect(isShowcasable(listing("a", "Còn trống", 1_000_000, 10))).toBe(true);
    expect(isShowcasable(listing("b", "Sắp trống", 1_000_000, 10))).toBe(true);
  });

  it("drops a let room, which belongs in the full table only", () => {
    expect(isShowcasable(listing("c", "Đã cho thuê", 1_000_000, 10))).toBe(false);
  });

  // Filtering, not sorting: a fixed-size slice off the top of a sorted list
  // still surfaces let rooms once the available ones run out.
  it("removes let rooms from a slice instead of just ranking them last", () => {
    const all = [
      listing("thue-1", "Đã cho thuê", 1_000_000, 10),
      listing("thue-2", "Đã cho thuê", 2_000_000, 10),
      listing("trong-1", "Còn trống", 3_000_000, 10),
    ];

    expect(all.filter(isShowcasable).slice(0, 8).map((p) => p.slug)).toEqual(["trong-1"]);
  });
});
