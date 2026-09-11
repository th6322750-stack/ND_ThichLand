import { describe, expect, it } from "vitest";
import { splitHighlights } from "@/lib/highlights";

describe("splitHighlights", () => {
  it("uses one line per highlight from a Google Sheet cell", () => {
    expect(splitHighlights("View sông Hàn\nFull nội thất\r\nGần biển Mỹ Khê")).toEqual([
      "View sông Hàn",
      "Full nội thất",
      "Gần biển Mỹ Khê",
    ]);
  });

  it("keeps older separators compatible and removes empty items", () => {
    expect(splitHighlights(["Ban công • Nội thất", "Vào ngay|Gần công viên;;"])).toEqual([
      "Ban công",
      "Nội thất",
      "Vào ngay",
      "Gần công viên",
    ]);
  });
});
