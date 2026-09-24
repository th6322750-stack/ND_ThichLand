import { describe, it, expect } from "vitest";
import { PROJECT_AMENITY_CATALOG, iconForAmenity } from "@/lib/projectAmenities";

describe("iconForAmenity", () => {
  it("returns the catalog-assigned icon for a known label", () => {
    expect(iconForAmenity("Hồ bơi vô cực")).toBe("pool");
    expect(iconForAmenity("Gym & Yoga")).toBe("dumbbell");
    expect(iconForAmenity("An ninh 24/7")).toBe("shield");
  });

  it("never mismatches by array position — order-independent lookup", () => {
    // Regression guard for the bug this catalog replaced: icons used to be
    // assigned by index into a project's own amenities array, so a project
    // whose second amenity happened to be "An ninh 24/7" got whatever icon
    // sat at position 1 in a fixed list, not the icon for that label.
    const shuffled = [...PROJECT_AMENITY_CATALOG].reverse();
    for (const { label, icon } of shuffled) {
      expect(iconForAmenity(label)).toBe(icon);
    }
  });

  it("falls back to a neutral icon for an off-catalog label instead of guessing", () => {
    expect(iconForAmenity("Một tiện ích chưa có trong danh mục")).toBe("check");
  });
});
