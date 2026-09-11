import { describe, expect, it } from "vitest";
import { moveItem } from "@/lib/admin/mediaOrder";

describe("admin media ordering", () => {
  it("moves any gallery image into the main/listing slot without mutating the source", () => {
    const source = ["main.jpg", "detail-a.jpg", "detail-b.jpg"];
    expect(moveItem(source, 2, 0)).toEqual(["detail-b.jpg", "main.jpg", "detail-a.jpg"]);
    expect(source).toEqual(["main.jpg", "detail-a.jpg", "detail-b.jpg"]);
  });

  it("ignores out-of-range moves safely", () => {
    expect(moveItem(["a", "b"], 0, -1)).toEqual(["a", "b"]);
    expect(moveItem(["a", "b"], 2, 0)).toEqual(["a", "b"]);
  });
});
