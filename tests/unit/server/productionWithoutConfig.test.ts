import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createSessionToken } from "@/lib/server/crypto/session";

/**
 * GĐ6 QA reopen — defect 03: "productionDemoContentForbiddenByDefault".
 * Simulates a real production runtime (NODE_ENV=production, VITEST unset)
 * with no Google/Drive config, and asserts every domain fails closed:
 * reads come back empty (never GĐ4/GĐ5 fixture content presented as real),
 * and writes are refused with a clear config error rather than appearing
 * to succeed against a throwaway in-memory store.
 */

const env = process.env as Record<string, string | undefined>;
const originalVitest = env.VITEST;
const originalNodeEnv = env.NODE_ENV;

function simulateProduction() {
  delete env.VITEST;
  env.NODE_ENV = "production";
}

function restoreEnv() {
  env.VITEST = originalVitest;
  env.NODE_ENV = originalNodeEnv;
}

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
vi.mock("next/headers", () => ({
  cookies: async () => mockCookieStore,
  headers: async () => ({ get: () => null }),
}));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

const TEST_SECRET = "test-secret-for-production-without-config";

function signInAsAdmin() {
  const now = Date.now();
  const token = createSessionToken({ sub: "admin@ndthich.vn", role: "admin", iat: now, exp: now + 60_000 }, TEST_SECRET);
  cookieJar.set("ndthich_admin_session", token);
}

describe("production runtime without Google/Drive config fails closed", () => {
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
    restoreEnv();
    vi.resetModules();
  });

  it("rental: public/admin listing is empty — GĐ4/GĐ5 fixture rows are never presented as real listings", async () => {
    simulateProduction();
    const { getRentalProviders } = await import("@/lib/server/rental/providers");
    const { buildMergedRentalData } = await import("@/lib/server/rental/merge");
    const { source, overlay } = await getRentalProviders();
    const merged = await buildMergedRentalData(source, overlay);
    expect(merged.admin).toHaveLength(0);
  });

  it("rental: saveBdsAction fails with a config error instead of pretending to persist", async () => {
    simulateProduction();
    signInAsAdmin();
    const { saveBdsAction } = await import("@/app/actions/bds");
    const result = await saveBdsAction(
      {
        slug: "", roomNo: "P.900", location: "Hà Nội", address: "A", priceRaw: "1000000",
        serviceFee: "", areaRaw: "10m2", verticalAccess: "", propertyType: "Nhà", description: "",
        highlights: [], availability: "Còn trống", bedroomCount: null, furnishingStatus: null,
        bathroomCount: null, amenities: [], locationNote: null, videoUrl: null,
        media: [], commission: "", guidePerson: "", internalNotes: "",
      },
      true,
    );
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/cấu hình/i);
  });

  it("projects: public listing is empty — fixture projects are never presented as real content", async () => {
    simulateProduction();
    const { getProjectRepository } = await import("@/lib/server/projects/providers");
    const { toPublicProjectListings } = await import("@/lib/server/projects/dto");
    const repo = await getProjectRepository();
    const records = await repo.list();
    expect(toPublicProjectListings(records)).toHaveLength(0);
  });

  it("projects: saveProjectAction fails with a config error", async () => {
    simulateProduction();
    signInAsAdmin();
    const { saveProjectAction } = await import("@/app/actions/projects");
    const result = await saveProjectAction(
      {
        slug: "", name: "Dự án Test", location: "Hà Nội", investor: "CDT", status: "Đang triển khai",
        summary: "", amenities: [], progressText: "", progressPercent: 0, media: [], progressPhotos: [],
      },
      true,
    );
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/cấu hình/i);
  });

  it("news: public listing is empty — fixture articles are never presented as real content", async () => {
    simulateProduction();
    const { getNewsRepository } = await import("@/lib/server/news/providers");
    const { toPublicNewsArticles } = await import("@/lib/server/news/dto");
    const repo = await getNewsRepository();
    const records = await repo.list();
    expect(toPublicNewsArticles(records)).toHaveLength(0);
  });

  it("news: saveNewsAction fails with a config error", async () => {
    simulateProduction();
    signInAsAdmin();
    const { saveNewsAction } = await import("@/app/actions/news");
    const result = await saveNewsAction(
      { slug: "", title: "Test", category: "Kinh nghiệm", excerpt: "", cover: "", sections: [] },
      true,
    );
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/cấu hình/i);
  });

  it("media: uploadMediaAction fails with a config error rather than a fake durable-success response", async () => {
    simulateProduction();
    signInAsAdmin();
    const { uploadMediaAction } = await import("@/app/actions/media");
    const fakeFormData = { get: () => null } as unknown as FormData;
    const result = await uploadMediaAction(fakeFormData);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/cấu hình/i);
  });

  it("contact: submitContactAction returns the existing generic failure instead of a fake success", async () => {
    simulateProduction();
    const { submitContactAction } = await import("@/app/actions/contact");
    const result = await submitContactAction({
      name: "Nguyễn Văn A",
      phone: "0912345678",
      need: "",
      area: "",
      message: "",
      website: "",
    });
    expect(result.ok).toBe(false);
  });
});

describe("NODE_ENV=test / local development still allow mock providers (unaffected by defect 03's fix)", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("rental fixture data is still seeded and published under the normal test env", async () => {
    const { getRentalProviders } = await import("@/lib/server/rental/providers");
    const { buildMergedRentalData } = await import("@/lib/server/rental/merge");
    const { source, overlay } = await getRentalProviders();
    const merged = await buildMergedRentalData(source, overlay);
    expect(merged.admin.length).toBeGreaterThan(0);
  });
});
