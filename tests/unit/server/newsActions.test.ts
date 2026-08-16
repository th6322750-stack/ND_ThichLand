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

const TEST_SECRET = "test-secret-for-news-actions";

function signInAsAdmin() {
  const now = Date.now();
  const token = createSessionToken({ sub: "admin@ndthich.vn", role: "admin", iat: now, exp: now + 60_000 }, TEST_SECRET);
  cookieJar.set("ndthich_admin_session", token);
}

const baseInput = {
  slug: "",
  title: "Bài viết Test",
  category: "Kinh nghiệm",
  excerpt: "Tóm tắt test",
  cover: "/images/test-cover.jpg",
  sections: [{ heading: "Mở đầu", body: "Nội dung test" }],
  readMinutes: 5,
};

describe("News admin actions", () => {
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

  it("rejects saveNewsAction when unauthenticated", async () => {
    const { saveNewsAction } = await import("@/app/actions/news");
    const result = await saveNewsAction(baseInput, true);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/đăng nhập/i);
  });

  it("rejects an invalid form (missing title/category)", async () => {
    signInAsAdmin();
    const { saveNewsAction } = await import("@/app/actions/news");
    const result = await saveNewsAction({ ...baseInput, title: "", category: "" }, true);
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toMatchObject({ title: expect.any(String), category: expect.any(String) });
  });

  it("creates a new article that shows up in the admin list", async () => {
    signInAsAdmin();
    const { saveNewsAction, listAdminNewsAction } = await import("@/app/actions/news");
    const result = await saveNewsAction({ ...baseInput, slug: "bai-viet-test-create" }, true);
    expect(result.ok).toBe(true);
    const list = await listAdminNewsAction();
    const created = list!.find((r) => r.slug === "bai-viet-test-create");
    expect(created).toBeDefined();
    expect(created!.published).toBe(true);
    expect(created!.category).toBe("Kinh nghiệm");
  });

  it("editing an existing (fixture-seeded) article updates it in place — no orphaned duplicate", async () => {
    signInAsAdmin();
    const { saveNewsAction, listAdminNewsAction } = await import("@/app/actions/news");
    const before = await listAdminNewsAction();
    const target = before![0];
    const countBefore = before!.length;

    await saveNewsAction(
      {
        slug: target.slug,
        title: target.title,
        category: "Danh mục đã cập nhật",
        excerpt: target.excerpt,
        cover: target.cover,
        sections: target.sections,
      },
      true,
    );

    const after = await listAdminNewsAction();
    expect(after!.length).toBe(countBefore);
    const matches = after!.filter((r) => r.slug === target.slug);
    expect(matches).toHaveLength(1);
    expect(matches[0].category).toBe("Danh mục đã cập nhật");
  });

  it("deleteNewsAction soft-deletes — record no longer published", async () => {
    signInAsAdmin();
    const { saveNewsAction, deleteNewsAction, listAdminNewsAction } = await import("@/app/actions/news");
    await saveNewsAction({ ...baseInput, slug: "bai-viet-se-xoa" }, true);
    const result = await deleteNewsAction("custom:bai-viet-se-xoa");
    expect(result.ok).toBe(true);
    const list = await listAdminNewsAction();
    const deleted = list!.find((r) => r.slug === "bai-viet-se-xoa");
    expect(deleted!.published).toBe(false);
  });
});
