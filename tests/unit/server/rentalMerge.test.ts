import { describe, it, expect } from "vitest";
import { buildMergedRentalData } from "@/lib/server/rental/merge";
import { toPublicPropertyListing, toPublicPropertyListings } from "@/lib/server/rental/dto";
import { InMemoryRentalSource } from "@/lib/server/rental/source";
import { InMemoryRentalOverlayRepository, type CustomBdsRecord } from "@/lib/server/rental/overlay";
import type { RawRentalRow } from "@/lib/server/rental/types";

const VALID_ROW: RawRentalRow = {
  sourceRow: 10,
  cells: [
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
    "Căn hộ 2 phòng ngủ, 2 ngủ 1 khách",
    "Ban công|Vào ngay",
    "Anh Tuấn - 0912345678",
    "Chủ nhà khó tính",
  ],
};

const SEPARATOR_ROW: RawRentalRow = { sourceRow: 11, cells: ["TÒA B", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""] };
const QUARANTINED_ROW: RawRentalRow = { sourceRow: 12, cells: ["Tòa C", "Còn trống", "Hà Nội", "X", "", "P.9", "5.000.000"] };

describe("buildMergedRentalData", () => {
  it("normalizes a raw row into an admin record with a stable, roomNo-based slug", async () => {
    const source = new InMemoryRentalSource([VALID_ROW]);
    const overlay = new InMemoryRentalOverlayRepository();
    const merged = await buildMergedRentalData(source, overlay);
    expect(merged.admin).toHaveLength(1);
    expect(merged.admin[0].slug).toBe("p-301-10");
    expect(merged.admin[0].sourceId).toBe("sheet:10");
    expect(merged.admin[0].price).toBe(12_000_000);
    expect(merged.admin[0].published).toBe(true);
  });

  it("excludes ignored (separator) and quarantined rows from the admin list, but counts them", async () => {
    const source = new InMemoryRentalSource([VALID_ROW, SEPARATOR_ROW, QUARANTINED_ROW]);
    const overlay = new InMemoryRentalOverlayRepository();
    const merged = await buildMergedRentalData(source, overlay);
    expect(merged.admin).toHaveLength(1);
    expect(merged.diagnostics.ignored).toBe(1);
    expect(merged.diagnostics.quarantined).toBe(1);
    expect(merged.diagnostics.quarantinedRows[0].sourceRow).toBe(12);
  });

  it("a record with unparseable price/area is not published (but still visible to admin)", async () => {
    const badRow: RawRentalRow = {
      sourceRow: 13,
      cells: [
        "Tòa A", "Còn trống", "Hà Nội", "X", "", "P.10", "giá thỏa thuận", "", "Theo tháng",
        "chưa rõ", "Thang bộ", "Nhà", "Nhà nguyên căn", "", "", "",
      ],
    };
    const source = new InMemoryRentalSource([badRow]);
    const overlay = new InMemoryRentalOverlayRepository();
    const merged = await buildMergedRentalData(source, overlay);
    expect(merged.admin).toHaveLength(1);
    expect(merged.admin[0].published).toBe(false);
  });

  it("applies an override patch by sourceId (edit)", async () => {
    const source = new InMemoryRentalSource([VALID_ROW]);
    const overlay = new InMemoryRentalOverlayRepository();
    await overlay.upsertOverride({
      sourceId: "sheet:10",
      patch: { price: 13_500_000, description: "Đã sửa lại mô tả" },
      hidden: false,
      updatedAt: "2026-08-14T00:00:00.000Z",
      updatedBy: "admin@ndthich.vn",
    });
    const merged = await buildMergedRentalData(source, overlay);
    expect(merged.admin).toHaveLength(1);
    expect(merged.admin[0].price).toBe(13_500_000);
    expect(merged.admin[0].description).toBe("Đã sửa lại mô tả");
    // slug must NOT be affected by the patch — route identity stays stable
    expect(merged.admin[0].slug).toBe("p-301-10");
  });

  it("an override with hidden:true removes the record from the merged list entirely", async () => {
    const source = new InMemoryRentalSource([VALID_ROW]);
    const overlay = new InMemoryRentalOverlayRepository();
    await overlay.upsertOverride({
      sourceId: "sheet:10",
      patch: {},
      hidden: true,
      updatedAt: "2026-08-14T00:00:00.000Z",
      updatedBy: "admin@ndthich.vn",
    });
    const merged = await buildMergedRentalData(source, overlay);
    expect(merged.admin).toHaveLength(0);
  });

  it("appends WEB_BDS_CUSTOM records alongside source-derived ones", async () => {
    const source = new InMemoryRentalSource([VALID_ROW]);
    const overlay = new InMemoryRentalOverlayRepository();
    const custom: CustomBdsRecord = {
      id: "custom-1",
      slug: "can-ho-moi-them",
      roomNo: "P.999",
      location: "Hà Nội",
      address: "999 Đường Mới",
      price: 15_000_000,
      serviceFee: "Đã gồm",
      area: 55,
      verticalAccess: "Thang máy",
      propertyType: "Căn hộ",
      description: "Căn hộ mới thêm qua Admin",
      highlights: ["Mới"],
      availability: "Còn trống",
      bedroomCount: 2,
      furnishingStatus: "Đầy đủ",
      media: [],
      commission: "",
      guidePerson: "",
      internalNotes: "",
      published: true,
      createdAt: "2026-08-14T00:00:00.000Z",
      updatedAt: "2026-08-14T00:00:00.000Z",
    };
    await overlay.upsertCustomRecord(custom);
    const merged = await buildMergedRentalData(source, overlay);
    expect(merged.admin).toHaveLength(2);
    const customResult = merged.admin.find((r) => r.slug === "can-ho-moi-them");
    expect(customResult).toBeDefined();
    expect(customResult!.sourceId).toBeUndefined();
  });

  it("a soft-deleted custom record no longer appears in the merged list", async () => {
    const source = new InMemoryRentalSource([]);
    const overlay = new InMemoryRentalOverlayRepository();
    const custom: CustomBdsRecord = {
      id: "custom-2", slug: "se-bi-xoa", roomNo: "P.1", location: "Hà Nội", address: "A",
      price: 1_000_000, serviceFee: "", area: 20, verticalAccess: "", propertyType: "Nhà",
      description: "", highlights: [], availability: "Còn trống", bedroomCount: null,
      furnishingStatus: null, media: [], commission: "", guidePerson: "", internalNotes: "",
      published: true, createdAt: "2026-08-14T00:00:00.000Z", updatedAt: "2026-08-14T00:00:00.000Z",
    };
    await overlay.upsertCustomRecord(custom);
    await overlay.softDeleteCustomRecord("custom-2");
    const merged = await buildMergedRentalData(source, overlay);
    const stillPresent = merged.admin.find((r) => r.slug === "se-bi-xoa");
    expect(stillPresent?.published).toBe(false);
    expect(toPublicPropertyListings(merged.admin)).toHaveLength(0);
  });
});

describe("toPublicPropertyListing — internal field stripping", () => {
  it("never includes commission, guidePerson, internalNotes, sourceId, or published on the public shape", async () => {
    const source = new InMemoryRentalSource([VALID_ROW]);
    const overlay = new InMemoryRentalOverlayRepository();
    const merged = await buildMergedRentalData(source, overlay);
    const dto = toPublicPropertyListing(merged.admin[0]);
    expect(dto).not.toHaveProperty("commission");
    expect(dto).not.toHaveProperty("guidePerson");
    expect(dto).not.toHaveProperty("internalNotes");
    expect(dto).not.toHaveProperty("sourceId");
    expect(dto).not.toHaveProperty("published");
    // sanity: real public fields are still present
    expect(dto.slug).toBe(merged.admin[0].slug);
    expect(dto.price).toBe(merged.admin[0].price);
  });

  it("toPublicPropertyListings filters out unpublished records entirely", async () => {
    const badRow: RawRentalRow = {
      sourceRow: 14,
      cells: [
        "Tòa A", "Còn trống", "Hà Nội", "X", "", "P.11", "malformed-price", "", "Theo tháng",
        "malformed-area", "Thang bộ", "Nhà", "Mô tả", "", "", "",
      ],
    };
    const source = new InMemoryRentalSource([VALID_ROW, badRow]);
    const overlay = new InMemoryRentalOverlayRepository();
    const merged = await buildMergedRentalData(source, overlay);
    const publicListings = toPublicPropertyListings(merged.admin);
    expect(publicListings).toHaveLength(1);
    expect(publicListings[0].slug).toBe("p-301-10");
  });
});
