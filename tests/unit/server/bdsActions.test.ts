import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createSessionToken } from "@/lib/server/crypto/session";

const cookieJar = new Map<string, string>();
const mockCookieStore = {
  get(name: string) {
    return cookieJar.has(name) ? { name, value: cookieJar.get(name)! } : undefined;
  },
  set(name: string, value: string) {
    cookieJar.set(name, value);
  },
  delete(name: string) {
    cookieJar.delete(name);
  },
};

vi.mock("next/headers", () => ({ cookies: async () => mockCookieStore }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

const TEST_SECRET = "test-secret-for-bds-actions";

function signInAsAdmin() {
  const now = Date.now();
  const token = createSessionToken({ sub: "admin@ndthich.vn", role: "admin", iat: now, exp: now + 60_000 }, TEST_SECRET);
  cookieJar.set("ndthich_admin_session", token);
}

describe("BĐS admin actions", () => {
  beforeEach(() => {
    cookieJar.clear();
    process.env.ADMIN_EMAIL = "admin@ndthich.vn";
    process.env.ADMIN_PASSWORD_HASH = "scrypt:1:1:1:00:00";
    process.env.AUTH_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD_HASH;
    delete process.env.AUTH_SECRET;
    vi.resetModules();
  });

  it("rejects saveBdsAction when unauthenticated", async () => {
    const { saveBdsAction } = await import("@/app/actions/bds");
    const result = await saveBdsAction(
      {
        slug: "",
        roomNo: "P.777",
        location: "Hà Nội",
        address: "A",
        priceRaw: "1000000",
        serviceFee: "",
        areaRaw: "10m2",
        verticalAccess: "",
        propertyType: "Nhà",
        description: "",
        highlights: [],
        availability: "Còn trống",
        bedroomCount: null,
        furnishingStatus: null,
        bathroomCount: null,
        amenities: [],
        locationNote: null,
        videoUrl: null,
        media: [],
        commission: "",
        guidePerson: "",
        internalNotes: "",
      },
      true,
    );
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/đăng nhập/i);
  });

  it("rejects an invalid propertyType/availability with field errors instead of silently coercing (GĐ6 QA reopen, defect 01)", async () => {
    signInAsAdmin();
    const { saveBdsAction } = await import("@/app/actions/bds");
    const result = await saveBdsAction(
      {
        slug: "",
        roomNo: "P.778",
        location: "Hà Nội",
        address: "A",
        priceRaw: "1000000",
        serviceFee: "",
        areaRaw: "10m2",
        verticalAccess: "",
        propertyType: "loại không tồn tại",
        description: "",
        highlights: [],
        availability: "trạng thái không tồn tại",
        bedroomCount: null,
        furnishingStatus: null,
        bathroomCount: null,
        amenities: [],
        locationNote: null,
        videoUrl: null,
        media: [],
        commission: "",
        guidePerson: "",
        internalNotes: "",
      },
      true,
    );
    expect(result.ok).toBe(false);
    expect(result.fieldErrors?.propertyType).toBeDefined();
    expect(result.fieldErrors?.availability).toBeDefined();
  });

  it("rejects an invalid form (missing required fields) with fieldErrors, does not persist", async () => {
    signInAsAdmin();
    const { saveBdsAction, listAdminBdsAction } = await import("@/app/actions/bds");
    const before = await listAdminBdsAction();
    const result = await saveBdsAction(
      {
        slug: "",
        roomNo: "",
        location: "",
        address: "",
        priceRaw: "0",
        serviceFee: "",
        areaRaw: "",
        verticalAccess: "",
        propertyType: "Nhà",
        description: "",
        highlights: [],
        availability: "Còn trống",
        bedroomCount: null,
        furnishingStatus: null,
        bathroomCount: null,
        amenities: [],
        locationNote: null,
        videoUrl: null,
        media: [],
        commission: "",
        guidePerson: "",
        internalNotes: "",
      },
      true,
    );
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toMatchObject({ roomNo: expect.any(String), price: expect.any(String) });
    const after = await listAdminBdsAction();
    expect(after!.length).toBe(before!.length);
  });

  it("creates a new custom record (Lưu & đăng) that immediately shows up in the admin list", async () => {
    signInAsAdmin();
    const { saveBdsAction, listAdminBdsAction } = await import("@/app/actions/bds");
    const result = await saveBdsAction(
      {
        slug: "phong-moi-test-create",
        roomNo: "P.TEST-CREATE",
        location: "Hà Nội",
        address: "Test address",
        priceRaw: "7.000.000",
        serviceFee: "Theo tháng",
        areaRaw: "30m2",
        verticalAccess: "Thang bộ",
        propertyType: "Studio",
        description: "Test",
        highlights: ["A"],
        availability: "Còn trống",
        bedroomCount: null,
        furnishingStatus: null,
        bathroomCount: null,
        amenities: ["Hồ bơi", "Gym"],
        locationNote: "Gần trung tâm, kết nối thuận tiện",
        videoUrl: "https://youtube.com/watch?v=abc123",
        media: [],
        commission: "",
        guidePerson: "",
        internalNotes: "",
      },
      true,
    );
    expect(result.ok).toBe(true);
    const list = await listAdminBdsAction();
    const created = list!.find((r) => r.slug === "phong-moi-test-create");
    expect(created).toBeDefined();
    expect(created!.published).toBe(true);
    expect(created!.price).toBe(7_000_000);
    expect(created!.amenities).toEqual(["Hồ bơi", "Gym"]);
    expect(created!.locationNote).toBe("Gần trung tâm, kết nối thuận tiện");
    expect(created!.videoUrl).toBe("https://youtube.com/watch?v=abc123");
  });

  it('"Lưu nháp" persists with published:false', async () => {
    signInAsAdmin();
    const { saveBdsAction, listAdminBdsAction } = await import("@/app/actions/bds");
    await saveBdsAction(
      {
        slug: "phong-nhap-test",
        roomNo: "P.TEST-DRAFT",
        location: "Hà Nội",
        address: "Test address",
        priceRaw: "5.000.000",
        serviceFee: "",
        areaRaw: "25m2",
        verticalAccess: "",
        propertyType: "Studio",
        description: "",
        highlights: [],
        availability: "Còn trống",
        bedroomCount: null,
        furnishingStatus: null,
        bathroomCount: null,
        amenities: [],
        locationNote: null,
        videoUrl: null,
        media: [],
        commission: "",
        guidePerson: "",
        internalNotes: "",
      },
      false,
    );
    const list = await listAdminBdsAction();
    const draft = list!.find((r) => r.slug === "phong-nhap-test");
    expect(draft!.published).toBe(false);
  });

  it("editing a sheet-derived record writes an override patch without touching the raw source", async () => {
    signInAsAdmin();
    const { saveBdsAction, listAdminBdsAction } = await import("@/app/actions/bds");
    await saveBdsAction(
      {
        slug: "irrelevant",
        sourceId: "sheet:999",
        roomNo: "P.OVERRIDE-TEST",
        location: "Hà Nội",
        address: "Edited address",
        priceRaw: "9.999.000",
        serviceFee: "Theo tháng",
        areaRaw: "40m2",
        verticalAccess: "Thang máy",
        propertyType: "Nhà",
        description: "Edited",
        highlights: [],
        availability: "Còn trống",
        bedroomCount: 2,
        furnishingStatus: "Đầy đủ",
        bathroomCount: 1,
        amenities: ["Hồ bơi"],
        locationNote: "Gần trung tâm",
        videoUrl: null,
        media: [],
        commission: "",
        guidePerson: "",
        internalNotes: "",
      },
      true,
    );
    const list = await listAdminBdsAction();
    // The record won't show up here since there's no matching raw source row
    // in the InMemory source (empty) for sheet:999 — but the override write
    // itself must not throw, and must not create a stray custom record.
    expect(list!.some((r) => r.slug === "irrelevant")).toBe(false);
  });

  it("hideBdsSourceRecordAction and deleteCustomBdsRecordAction both require auth", async () => {
    const { hideBdsSourceRecordAction, deleteCustomBdsRecordAction } = await import("@/app/actions/bds");
    expect((await hideBdsSourceRecordAction("sheet:1")).ok).toBe(false);
    expect((await deleteCustomBdsRecordAction("custom:x")).ok).toBe(false);
  });

  it("deleteCustomBdsRecordAction soft-deletes — record no longer appears published", async () => {
    signInAsAdmin();
    const { saveBdsAction, deleteCustomBdsRecordAction, listAdminBdsAction } = await import("@/app/actions/bds");
    await saveBdsAction(
      {
        slug: "phong-se-xoa",
        roomNo: "P.TEST-DELETE",
        location: "Hà Nội",
        address: "A",
        priceRaw: "3.000.000",
        serviceFee: "",
        areaRaw: "20m2",
        verticalAccess: "",
        propertyType: "Studio",
        description: "",
        highlights: [],
        availability: "Còn trống",
        bedroomCount: null,
        furnishingStatus: null,
        bathroomCount: null,
        amenities: [],
        locationNote: null,
        videoUrl: null,
        media: [],
        commission: "",
        guidePerson: "",
        internalNotes: "",
      },
      true,
    );
    const result = await deleteCustomBdsRecordAction("custom:phong-se-xoa");
    expect(result.ok).toBe(true);
    const list = await listAdminBdsAction();
    const deleted = list!.find((r) => r.slug === "phong-se-xoa");
    expect(deleted!.published).toBe(false);
  });

  it("editing an existing (fixture-seeded) record updates it in place — no orphaned duplicate", async () => {
    signInAsAdmin();
    const { saveBdsAction, listAdminBdsAction } = await import("@/app/actions/bds");
    const before = await listAdminBdsAction();
    const target = before!.find((r) => !r.sourceId); // any pre-seeded custom record
    expect(target).toBeDefined();
    const countBefore = before!.length;

    await saveBdsAction(
      {
        slug: target!.slug,
        roomNo: target!.roomNo,
        location: target!.location,
        address: target!.address,
        priceRaw: "99.000.000",
        serviceFee: target!.serviceFee,
        areaRaw: `${target!.area}m2`,
        verticalAccess: target!.verticalAccess,
        propertyType: target!.propertyType ?? "",
        description: target!.description,
        highlights: target!.highlights,
        availability: target!.availability ?? "",
        bedroomCount: target!.bedroomCount,
        furnishingStatus: target!.furnishingStatus,
        bathroomCount: target!.bathroomCount,
        amenities: target!.amenities,
        locationNote: target!.locationNote,
        videoUrl: target!.videoUrl,
        media: target!.media,
        commission: target!.commission,
        guidePerson: target!.guidePerson,
        internalNotes: target!.internalNotes,
      },
      true,
    );

    const after = await listAdminBdsAction();
    expect(after!.length).toBe(countBefore); // no new row created
    const matches = after!.filter((r) => r.slug === target!.slug);
    expect(matches).toHaveLength(1); // no duplicate slug
    expect(matches[0].price).toBe(99_000_000);
  });
});
