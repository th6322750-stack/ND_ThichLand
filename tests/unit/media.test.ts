import { describe, it, expect } from "vitest";
import { firstMedia, mediaSrc, PROPERTY_PLACEHOLDER, NEWS_PLACEHOLDER } from "@/lib/media";

// next/image throws on an empty/undefined src, and every admin form allows
// saving a record without a photo — so these guards are what stops a
// photo-less CMS record from 500-ing a public route.
describe("firstMedia", () => {
  it("returns the first usable entry", () => {
    expect(firstMedia(["/a.png", "/b.png"], PROPERTY_PLACEHOLDER)).toBe("/a.png");
  });

  it("falls back for empty, undefined, and blank-string-only lists", () => {
    expect(firstMedia([], PROPERTY_PLACEHOLDER)).toBe(PROPERTY_PLACEHOLDER);
    expect(firstMedia(undefined, PROPERTY_PLACEHOLDER)).toBe(PROPERTY_PLACEHOLDER);
    expect(firstMedia(["", "   "], PROPERTY_PLACEHOLDER)).toBe(PROPERTY_PLACEHOLDER);
  });

  it("skips a leading blank rather than returning it", () => {
    expect(firstMedia(["", "/real.png"], PROPERTY_PLACEHOLDER)).toBe("/real.png");
  });
});

describe("mediaSrc", () => {
  it("falls back on empty/null/undefined", () => {
    expect(mediaSrc("", NEWS_PLACEHOLDER)).toBe(NEWS_PLACEHOLDER);
    expect(mediaSrc(null, NEWS_PLACEHOLDER)).toBe(NEWS_PLACEHOLDER);
    expect(mediaSrc(undefined, NEWS_PLACEHOLDER)).toBe(NEWS_PLACEHOLDER);
    expect(mediaSrc("/cover.png", NEWS_PLACEHOLDER)).toBe("/cover.png");
  });
});
