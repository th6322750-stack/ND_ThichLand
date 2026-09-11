import { describe, it, expect } from "vitest";
import {
  parseRentalRow,
  parsePriceVnd,
  parseAreaM2,
  parseAvailability,
  parseBedroomCount,
  parseFurnishingStatus,
} from "@/lib/server/rental/parse";
import type { RawRentalRow } from "@/lib/server/rental/types";

function row(sourceRow: number, cells: string[]): RawRentalRow {
  return { sourceRow, cells };
}

describe("parseRentalRow — normal canonical row", () => {
  it("parses a well-formed row at its canonical columns", () => {
    const outcome = parseRentalRow(
      row(10, [
        "Tòa A",
        "Vào luôn",
        "Hà Nội",
        "123 Đường Láng",
        "https://drive.google.com/drive/folders/abc",
        "P.301",
        "12.000.000",
        "1 tháng tiền thuê",
        "Theo tháng",
        "70m2",
        "Thang máy",
        "Căn hộ",
        "Căn hộ 2 phòng ngủ, 2 ngủ 1 khách, nội thất đầy đủ",
        "Ban công|Vào ngay",
        "Anh Tuấn - 0912345678",
        "Chủ nhà khó tính",
      ]),
    );
    expect(outcome.kind).toBe("valid");
    if (outcome.kind !== "valid") return;
    expect(outcome.record.sourceId).toBe("sheet:10");
    expect(outcome.record.wasRepaired).toBe(false);
    expect(outcome.record.price).toBe(12_000_000);
    expect(outcome.record.area).toBe(70);
    expect(outcome.record.propertyType).toBe("Căn hộ");
    expect(outcome.record.availability).toBe("Còn trống");
    expect(outcome.record.bedroomCount).toBe(2);
    expect(outcome.record.furnishingStatus).toBe("Đầy đủ");
    expect(outcome.record.highlights).toEqual(["Ban công", "Vào ngay"]);
  });

  it("turns line breaks in the Sheet cell into separate highlights", () => {
    const cells = [
      "Tòa A",
      "Còn trống",
      "Đà Nẵng",
      "Panoma 1",
      "",
      "P.1201",
      "20.000.000",
      "",
      "Theo tháng",
      "80m2",
      "Thang máy",
      "Căn hộ",
      "Căn hộ view sông",
      "🌊 View sông Hàn\n✨ Full nội thất\n🏖️ Gần biển Mỹ Khê",
      "",
      "",
    ];
    const outcome = parseRentalRow(row(11, cells));
    expect(outcome.kind).toBe("valid");
    if (outcome.kind !== "valid") return;
    expect(outcome.record.highlights).toEqual([
      "🌊 View sông Hàn",
      "✨ Full nội thất",
      "🏖️ Gần biển Mỹ Khê",
    ]);
  });
});

describe("parseRentalRow — separator/note rows", () => {
  it("ignores a group-title row with no room/price/area signal", () => {
    const outcome = parseRentalRow(row(5, ["TÒA A - TẦNG 3", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]));
    expect(outcome.kind).toBe("ignored");
  });

  it("ignores a fully empty row", () => {
    const outcome = parseRentalRow(row(6, []));
    expect(outcome.kind).toBe("ignored");
  });
});

describe("parseRentalRow — missing commission causing left shift", () => {
  it("detects the area-shaped value one column left and repairs the row", () => {
    const outcome = parseRentalRow(
      row(20, [
        "Tòa B",
        "Còn trống",
        "Hà Nội",
        "456 Đường Giải Phóng",
        "https://drive.google.com/drive/folders/xyz",
        "P.205",
        "8.500.000",
        "Theo tháng", // sitting at commission's canonical slot — really service_fee
        "45m2", // sitting at service_fee's canonical slot — really area
        "Thang bộ", // sitting at area's canonical slot — really vertical_access
        "Nhà", // really property_type
        "Nhà nguyên căn, 2 ngủ 1 khách", // really description
        "An ninh|Chỗ để xe", // really highlights
        "Chị Lan - 0987654321", // really guide_person
        "Ghi chú nội bộ", // really internal_notes
      ]),
    );
    expect(outcome.kind).toBe("valid");
    if (outcome.kind !== "valid") return;
    expect(outcome.record.wasRepaired).toBe(true);
    expect(outcome.record.commission).toBe("");
    expect(outcome.record.serviceFee).toBe("Theo tháng");
    expect(outcome.record.area).toBe(45);
    expect(outcome.record.verticalAccess).toBe("Thang bộ");
    expect(outcome.record.propertyType).toBe("Nhà");
    expect(outcome.record.bedroomCount).toBe(2);
  });

  it("quarantines a structurally truncated row instead of guessing", () => {
    const outcome = parseRentalRow(row(21, ["Tòa C", "Còn trống", "Hà Nội", "789 Đường X", "", "P.9", "5.000.000"]));
    expect(outcome.kind).toBe("quarantined");
  });
});

describe("parseRentalRow — malformed values stay null, not quarantined", () => {
  it("malformed price yields price: null on an otherwise-valid row", () => {
    const outcome = parseRentalRow(
      row(30, [
        "Tòa A",
        "Còn trống",
        "Hà Nội",
        "123 Đường Láng",
        "",
        "P.302",
        "giá thỏa thuận",
        "",
        "Theo tháng",
        "50m2",
        "Thang bộ",
        "Nhà",
        "Nhà nguyên căn",
        "",
        "",
        "",
      ]),
    );
    expect(outcome.kind).toBe("valid");
    if (outcome.kind !== "valid") return;
    expect(outcome.record.price).toBeNull();
    expect(outcome.record.priceRaw).toBe("giá thỏa thuận");
  });

  it("malformed area yields area: null without quarantining the row", () => {
    const outcome = parseRentalRow(
      row(31, [
        "Tòa A",
        "Còn trống",
        "Hà Nội",
        "123 Đường Láng",
        "",
        "P.303",
        "9.000.000",
        "",
        "Theo tháng",
        "khoảng 35",
        "Thang bộ",
        "Nhà",
        "Nhà nguyên căn",
        "",
        "",
        "",
      ]),
    );
    expect(outcome.kind).toBe("valid");
    if (outcome.kind !== "valid") return;
    expect(outcome.record.area).toBeNull();
    expect(outcome.record.areaRaw).toBe("khoảng 35");
  });
});

describe("parseRentalRow — availability", () => {
  const base = [
    "Tòa A",
    "",
    "Hà Nội",
    "123 Đường Láng",
    "",
    "P.304",
    "9.000.000",
    "",
    "Theo tháng",
    "40m2",
    "Thang bộ",
    "Nhà",
    "Nhà nguyên căn",
    "",
    "",
    "",
  ];

  it('"Vào luôn" normalizes to Còn trống', () => {
    const cells = [...base];
    cells[1] = "Vào luôn";
    const outcome = parseRentalRow(row(40, cells));
    expect(outcome.kind).toBe("valid");
    if (outcome.kind !== "valid") return;
    expect(outcome.record.availability).toBe("Còn trống");
    expect(outcome.record.availabilityRaw).toBe("Vào luôn");
  });

  it("a future/date-like availability normalizes to Sắp trống", () => {
    const cells = [...base];
    cells[1] = "Trống từ 15/09";
    const outcome = parseRentalRow(row(41, cells));
    expect(outcome.kind).toBe("valid");
    if (outcome.kind !== "valid") return;
    expect(outcome.record.availability).toBe("Sắp trống");
  });

  it('"Đã hết" normalizes to Đã cho thuê', () => {
    const cells = [...base];
    cells[1] = "Đã hết";
    const outcome = parseRentalRow(row(42, cells));
    expect(outcome.kind).toBe("valid");
    if (outcome.kind !== "valid") return;
    expect(outcome.record.availability).toBe("Đã cho thuê");
  });

  it("an unrecognized status stays null rather than being guessed", () => {
    const cells = [...base];
    cells[1] = "???";
    const outcome = parseRentalRow(row(43, cells));
    expect(outcome.kind).toBe("valid");
    if (outcome.kind !== "valid") return;
    expect(outcome.record.availability).toBeNull();
  });
});

describe("parseRentalRow — bedroom count (never inferred from Studio)", () => {
  it("extracts an explicit 1-bedroom phrase", () => {
    expect(parseBedroomCount("Căn 1 ngủ, ban công")).toBe(1);
  });

  it("extracts an explicit 2-bedroom + living room phrase", () => {
    expect(parseBedroomCount("2 ngủ 1 khách, đầy đủ nội thất")).toBe(2);
  });

  it("extracts from '1 khách 1 ngủ' ordering too", () => {
    expect(parseBedroomCount("1 khách 1 ngủ")).toBe(1);
  });

  it("never infers bedroomCount = 1 from the word Studio alone", () => {
    const outcome = parseRentalRow(
      row(50, [
        "Tòa A",
        "Còn trống",
        "Hà Nội",
        "123 Đường Láng",
        "",
        "P.305",
        "6.000.000",
        "",
        "Theo tháng",
        "28m2",
        "Thang bộ",
        "Studio",
        "Studio ban công thoáng",
        "",
        "",
        "",
      ]),
    );
    expect(outcome.kind).toBe("valid");
    if (outcome.kind !== "valid") return;
    expect(outcome.record.propertyType).toBe("Studio");
    expect(outcome.record.bedroomCount).toBeNull();
  });

  it("still extracts an explicit count even for a Studio listing that states one", () => {
    expect(parseBedroomCount("studio 1 bếp 1 ngủ")).toBe(1);
  });
});

describe("parseRentalRow — furnishing (only from explicit wording)", () => {
  it('captures an explicit "Nội thất: ..." statement', () => {
    expect(parseFurnishingStatus("Nội thất: điều hoà, giường, tủ lạnh")).toBe("điều hoà, giường, tủ lạnh");
  });

  it("maps đầy đủ / cơ bản phrases", () => {
    expect(parseFurnishingStatus("nội thất đầy đủ")).toBe("Đầy đủ");
    expect(parseFurnishingStatus("nội thất cơ bản")).toBe("Cơ bản");
  });

  it("does not infer a furnishing status from a bare appliance list", () => {
    expect(parseFurnishingStatus("điều hoà, giường, tủ lạnh, máy giặt")).toBeNull();
  });
});

describe("parseRentalRow — internal fields never leak into a shape a public mapper could accidentally forward", () => {
  it("keeps commission/guidePerson/internalNotes as distinct, clearly-internal record fields", () => {
    const outcome = parseRentalRow(
      row(60, [
        "Tòa A",
        "Còn trống",
        "Hà Nội",
        "123 Đường Láng",
        "",
        "P.306",
        "10.000.000",
        "1 tháng tiền thuê", // commission — internal
        "Theo tháng",
        "60m2",
        "Thang máy",
        "Nhà",
        "Nhà nguyên căn",
        "",
        "Anh Bình - 0909090909", // guidePerson — internal
        "Chủ nhà yêu cầu đặt cọc 2 tháng", // internalNotes — internal
      ]),
    );
    expect(outcome.kind).toBe("valid");
    if (outcome.kind !== "valid") return;
    expect(outcome.record.commission).toBe("1 tháng tiền thuê");
    expect(outcome.record.guidePerson).toBe("Anh Bình - 0909090909");
    expect(outcome.record.internalNotes).toBe("Chủ nhà yêu cầu đặt cọc 2 tháng");
    // The keys above only exist on NormalizedRentalRecord (the internal
    // shape) — Task 04/05's public DTO mapper is what's responsible for
    // never copying these three keys onto the public shape; verified in
    // the security test suite (Task 12) against the actual DTO mapper.
  });
});

describe("parsePriceVnd", () => {
  it.each([
    ["12.000.000", 12_000_000],
    ["6,5 triệu", 6_500_000],
    ["6 TRIỆU", 6_000_000],
    ["8000000", 8_000_000],
    ["6.500.000", 6_500_000],
    ["", null],
    ["giá thỏa thuận", null],
    ["0", null],
    // GĐ6 QA reopen (defect 02): the real production sheet contains this
    // exact ambiguous shape (rows 16 and 21, verified by ChatGPT) — a bare
    // "N,M" could mean N.M triệu (needs the unit, not present) or something
    // else entirely. Never guess; must return null, never "28".
    ["2,8", null],
    ["3,2", null],
    ["5,5", null],
  ])("parsePriceVnd(%s) -> %s", (input, expected) => {
    expect(parsePriceVnd(input)).toBe(expected);
  });
});

describe("parseAreaM2", () => {
  it.each([
    ["35m2", 35],
    ["35 m²", 35],
    ["35,5m2", 35.5],
    ["khoảng 35", null],
    ["", null],
  ])("parseAreaM2(%s) -> %s", (input, expected) => {
    expect(parseAreaM2(input)).toBe(expected);
  });
});

describe("parseAvailability", () => {
  it.each([
    ["Vào luôn", "Còn trống"],
    ["còn trống", "Còn trống"],
    ["đã hết", "Đã cho thuê"],
    ["Đã chốt khách", "Đã cho thuê"],
    ["cuối tháng 9", "Sắp trống"],
    ["15/10/2026", "Sắp trống"],
    ["", null],
    ["chưa rõ", null],
  ])("parseAvailability(%s) -> %s", (input, expected) => {
    expect(parseAvailability(input)).toBe(expected);
  });
});
