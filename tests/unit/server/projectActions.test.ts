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

const TEST_SECRET = "test-secret-for-project-actions";

function signInAsAdmin() {
  const now = Date.now();
  const token = createSessionToken({ sub: "admin@ndthich.vn", role: "admin", iat: now, exp: now + 60_000 }, TEST_SECRET);
  cookieJar.set("ndthich_admin_session", token);
}

const baseInput = {
  slug: "",
  name: "Dự án Test",
  location: "Hà Nội",
  investor: "Chủ đầu tư Test",
  status: "Đang triển khai" as const,
  summary: "Tóm tắt test",
  amenities: ["An ninh 24/7"],
  progressText: "Đang thi công",
  progressPercent: 30,
  media: [],
  progressPhotos: [],
};

describe("Project admin actions", () => {
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

  it("rejects saveProjectAction when unauthenticated", async () => {
    const { saveProjectAction } = await import("@/app/actions/projects");
    const result = await saveProjectAction(baseInput, true);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/đăng nhập/i);
  });

  it("rejects an invalid form (missing name/location)", async () => {
    signInAsAdmin();
    const { saveProjectAction } = await import("@/app/actions/projects");
    const result = await saveProjectAction({ ...baseInput, name: "", location: "" }, true);
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toMatchObject({ name: expect.any(String), location: expect.any(String) });
  });

  it("rejects an invalid status instead of silently coercing it (mirrors BDS defect-01 rule)", async () => {
    signInAsAdmin();
    const { saveProjectAction } = await import("@/app/actions/projects");
    const result = await saveProjectAction({ ...baseInput, slug: "du-an-trang-thai-la", status: "trạng thái lạ" }, true);
    expect(result.ok).toBe(false);
    expect(result.fieldErrors?.status).toBeDefined();
  });

  it("creates a new project that shows up in the admin list", async () => {
    signInAsAdmin();
    const { saveProjectAction, listAdminProjectsAction } = await import("@/app/actions/projects");
    const result = await saveProjectAction({ ...baseInput, slug: "du-an-test-create" }, true);
    expect(result.ok).toBe(true);
    const list = await listAdminProjectsAction();
    const created = list!.find((r) => r.slug === "du-an-test-create");
    expect(created).toBeDefined();
    expect(created!.published).toBe(true);
    expect(created!.investor).toBe("Chủ đầu tư Test");
  });

  it("persists progressPhotos (per-project milestone photos, not a shared hardcoded set)", async () => {
    signInAsAdmin();
    const { saveProjectAction, listAdminProjectsAction } = await import("@/app/actions/projects");
    await saveProjectAction(
      {
        ...baseInput,
        slug: "du-an-tien-do-test",
        progressPhotos: [
          { label: "Khởi công", image: "https://example.com/a.png" },
          { label: "Bàn giao", image: "https://example.com/b.png" },
        ],
      },
      true,
    );
    const list = await listAdminProjectsAction();
    const created = list!.find((r) => r.slug === "du-an-tien-do-test");
    expect(created!.progressPhotos).toEqual([
      { label: "Khởi công", image: "https://example.com/a.png" },
      { label: "Bàn giao", image: "https://example.com/b.png" },
    ]);
  });

  it("editing an existing (fixture-seeded) project updates it in place — no orphaned duplicate", async () => {
    signInAsAdmin();
    const { saveProjectAction, listAdminProjectsAction } = await import("@/app/actions/projects");
    const before = await listAdminProjectsAction();
    const target = before![0];
    const countBefore = before!.length;

    await saveProjectAction(
      {
        slug: target.slug,
        name: target.name,
        location: target.location,
        investor: "Chủ đầu tư đã cập nhật",
        status: target.status ?? "",
        summary: target.summary,
        amenities: target.amenities,
        progressText: target.progressText,
        progressPercent: target.progressPercent,
        media: target.media,
        progressPhotos: target.progressPhotos,
      },
      true,
    );

    const after = await listAdminProjectsAction();
    expect(after!.length).toBe(countBefore);
    const matches = after!.filter((r) => r.slug === target.slug);
    expect(matches).toHaveLength(1);
    expect(matches[0].investor).toBe("Chủ đầu tư đã cập nhật");
  });

  // Data-loss guard: two projects can easily share a name, and the id is
  // derived from it. Before this, the second save silently replaced the
  // first record's entire content.
  it("refuses to create a second project onto an existing slug instead of overwriting it", async () => {
    signInAsAdmin();
    const { saveProjectAction, listAdminProjectsAction } = await import("@/app/actions/projects");
    await saveProjectAction({ ...baseInput, name: "Khu Nhà Ở Trùng Tên", summary: "Bản gốc" }, true);
    const countAfterFirst = (await listAdminProjectsAction())!.length;

    const result = await saveProjectAction({ ...baseInput, name: "Khu Nhà Ở Trùng Tên", summary: "Bản ghi đè" }, true);

    expect(result.ok).toBe(false);
    expect(result.fieldErrors?.name).toMatch(/đã có dự án/i);
    const list = await listAdminProjectsAction();
    expect(list!.length).toBe(countAfterFirst);
    expect(list!.find((r) => r.slug === "khu-nha-o-trung-ten")!.summary).toBe("Bản gốc");
  });

  it("still updates in place when the edit form carries the existing slug", async () => {
    signInAsAdmin();
    const { saveProjectAction, listAdminProjectsAction } = await import("@/app/actions/projects");
    await saveProjectAction({ ...baseInput, name: "Dự án sửa được", summary: "v1" }, true);
    const result = await saveProjectAction(
      { ...baseInput, slug: "du-an-sua-duoc", name: "Dự án sửa được", summary: "v2" },
      true,
    );
    expect(result.ok).toBe(true);
    const list = await listAdminProjectsAction();
    expect(list!.filter((r) => r.slug === "du-an-sua-duoc")).toHaveLength(1);
    expect(list!.find((r) => r.slug === "du-an-sua-duoc")!.summary).toBe("v2");
  });

  it("saves as a draft when publish is false so an unpublished project is not silently republished", async () => {
    signInAsAdmin();
    const { saveProjectAction, listAdminProjectsAction } = await import("@/app/actions/projects");
    await saveProjectAction({ ...baseInput, name: "Dự án nháp" }, false);
    const list = await listAdminProjectsAction();
    expect(list!.find((r) => r.slug === "du-an-nhap")!.published).toBe(false);
  });

  it("clamps progressPercent into 0-100", async () => {
    signInAsAdmin();
    const { saveProjectAction, listAdminProjectsAction } = await import("@/app/actions/projects");
    await saveProjectAction({ ...baseInput, name: "Tiến độ vượt ngưỡng", progressPercent: 550 }, true);
    await saveProjectAction({ ...baseInput, name: "Tiến độ âm", progressPercent: -20 }, true);
    const list = await listAdminProjectsAction();
    expect(list!.find((r) => r.slug === "tien-do-vuot-nguong")!.progressPercent).toBe(100);
    expect(list!.find((r) => r.slug === "tien-do-am")!.progressPercent).toBe(0);
  });

  it("deleteProjectAction soft-deletes — record no longer published", async () => {
    signInAsAdmin();
    const { saveProjectAction, deleteProjectAction, listAdminProjectsAction } = await import("@/app/actions/projects");
    await saveProjectAction({ ...baseInput, slug: "du-an-se-xoa" }, true);
    const result = await deleteProjectAction("custom:du-an-se-xoa");
    expect(result.ok).toBe(true);
    const list = await listAdminProjectsAction();
    const deleted = list!.find((r) => r.slug === "du-an-se-xoa");
    expect(deleted!.published).toBe(false);
  });
});
