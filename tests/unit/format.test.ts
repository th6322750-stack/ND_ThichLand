import { describe, it, expect } from "vitest";
import { formatCurrencyVnd, formatArea } from "@/lib/format";

describe("formatCurrencyVnd", () => {
  it("formats whole VND with thousands separators and đ suffix", () => {
    expect(formatCurrencyVnd(12000000)).toBe("12.000.000đ");
    expect(formatCurrencyVnd(6500000)).toBe("6.500.000đ");
  });
});

describe("formatArea", () => {
  it("formats m2 with superscript unit", () => {
    expect(formatArea(70)).toBe("70m²");
    expect(formatArea(35.5)).toBe("35.5m²");
  });
});
