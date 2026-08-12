import { describe, it, expect } from "vitest";
import { normalizePropertyRow } from "@/lib/normalize";

describe("normalizePropertyRow", () => {
  it("returns null for a group-separator row", () => {
    expect(normalizePropertyRow({ room_no: "", area: "", is_group_header: "true" })).toBeNull();
  });

  it("normalizes price/area strings to numbers and maps sheet columns", () => {
    const row = {
      room_no: "P.301 - Tòa A",
      location: "Hà Nội",
      address: "123 Đường Láng",
      price: "6.500.000",
      service_fee: "Theo tháng",
      area: "35",
      vertical_access: "Thang bộ",
      property_type: "Studio",
      description: "Studio ban công thoáng",
      highlights: "Ban công|Nội thất|Vào ngay",
      availability: "Còn trống",
      media: "https://drive.google.com/file/d/abc/view",
      commission: "Theo dữ liệu",
      guide_person: "Tên / SĐT",
      internal_notes: "Ghi chú vận hành",
    };
    const result = normalizePropertyRow(row);
    expect(result?.price).toBe(6500000);
    expect(result?.area).toBe(35);
    expect(result?.highlights).toEqual(["Ban công", "Nội thất", "Vào ngay"]);
    // internal-only fields must never leak onto the normalized public shape
    expect(result).not.toHaveProperty("commission");
    expect(result).not.toHaveProperty("guide_person");
    expect(result).not.toHaveProperty("internal_notes");
  });
});
