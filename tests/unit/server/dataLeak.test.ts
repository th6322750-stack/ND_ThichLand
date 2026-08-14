import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createSessionToken } from "@/lib/server/crypto/session";
import { InMemoryRentalSource } from "@/lib/server/rental/source";
import { InMemoryRentalOverlayRepository, type CustomBdsRecord } from "@/lib/server/rental/overlay";
import { buildMergedRentalData } from "@/lib/server/rental/merge";
import { toPublicPropertyListing } from "@/lib/server/rental/dto";
import { toPublicProjectListing, toPublicProjectListings } from "@/lib/server/projects/dto";
import { toPublicNewsArticle, toPublicNewsArticles } from "@/lib/server/news/dto";
import type { ProjectRecord } from "@/lib/server/projects/repository";
import type { NewsRecord } from "@/lib/server/news/repository";
import { validateContactForm } from "@/lib/server/contact/validate";
import { getGoogleServiceAccountEnv, requireGoogleServiceAccountEnv, requireGoogleSpreadsheetEnv } from "@/lib/server/env";

/**
 * Task 12 — security / data-leak sweep. Complements (does not replace) the
 * per-domain tests already covering media MIME validation (mediaActions.test.ts),
 * rental parser quarantine behavior (rentalParse.test.ts, 40 cases), and
 * per-action unauthenticated rejection spot-checks (bdsActions/projectActions/
 * newsActions/mediaActions.test.ts each test their primary save action).
 * A green test suite alone does not certify security — this is one input
 * alongside live e2e verification, not a substitute for it.
 */

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

const TEST_SECRET = "test-secret-for-data-leak-sweep";

describe("unauthenticated requests are rejected by every admin mutation/list action", () => {
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

  it("BDS: save, hide, delete, and list all reject", async () => {
    const bds = await import("@/app/actions/bds");
    expect((await bds.saveBdsAction({} as never, true)).ok).toBe(false);
    expect((await bds.hideBdsSourceRecordAction("sheet:1")).ok).toBe(false);
    expect((await bds.deleteCustomBdsRecordAction("custom:x")).ok).toBe(false);
    expect(await bds.listAdminBdsAction()).toBeNull();
  });

  it("Projects: save, delete, and list all reject", async () => {
    const projects = await import("@/app/actions/projects");
    expect((await projects.saveProjectAction({} as never, true)).ok).toBe(false);
    expect((await projects.deleteProjectAction("custom:x")).ok).toBe(false);
    expect(await projects.listAdminProjectsAction()).toBeNull();
  });

  it("News: save, delete, and list all reject", async () => {
    const news = await import("@/app/actions/news");
    expect((await news.saveNewsAction({} as never, true)).ok).toBe(false);
    expect((await news.deleteNewsAction("custom:x")).ok).toBe(false);
    expect(await news.listAdminNewsAction()).toBeNull();
  });

  it("Media: upload, delete, and list all reject", async () => {
    const media = await import("@/app/actions/media");
    const fakeFormData = { get: () => null } as unknown as FormData;
    expect((await media.uploadMediaAction(fakeFormData)).ok).toBe(false);
    expect((await media.deleteMediaAction("media:x")).ok).toBe(false);
    expect(await media.listAdminMediaAction()).toBeNull();
  });
});

describe("public DTOs never leak internal-only fields", () => {
  it("rental: toPublicPropertyListing strips commission/guidePerson/internalNotes/sourceId/published", async () => {
    const source = new InMemoryRentalSource([]);
    const overlay = new InMemoryRentalOverlayRepository();
    const custom: CustomBdsRecord = {
      id: "custom-1", slug: "test-slug", roomNo: "P.1", location: "Hà Nội", address: "A",
      price: 1_000_000, serviceFee: "", area: 20, verticalAccess: "", propertyType: "Nhà",
      description: "", highlights: [], availability: "Còn trống", bedroomCount: null,
      furnishingStatus: null, media: [], commission: "SECRET-COMMISSION",
      guidePerson: "SECRET-GUIDE", internalNotes: "SECRET-NOTES",
      published: true, createdAt: "2026-08-14T00:00:00.000Z", updatedAt: "2026-08-14T00:00:00.000Z",
    };
    await overlay.upsertCustomRecord(custom);
    const merged = await buildMergedRentalData(source, overlay);
    const dto = toPublicPropertyListing(merged.admin[0]);
    const serialized = JSON.stringify(dto);
    expect(serialized).not.toContain("SECRET-COMMISSION");
    expect(serialized).not.toContain("SECRET-GUIDE");
    expect(serialized).not.toContain("SECRET-NOTES");
    expect(dto).not.toHaveProperty("commission");
    expect(dto).not.toHaveProperty("guidePerson");
    expect(dto).not.toHaveProperty("internalNotes");
    expect(dto).not.toHaveProperty("sourceId");
    expect(dto).not.toHaveProperty("published");
  });

  it("projects: toPublicProjectListing strips id/published/createdAt/updatedAt", () => {
    const record: ProjectRecord = {
      id: "custom:secret-id", slug: "du-an-test", name: "Dự án", location: "Hà Nội",
      investor: "Chủ đầu tư", status: "Đang triển khai", media: [], summary: "", amenities: [],
      progressText: "", progressPercent: 0, published: true,
      createdAt: "2026-08-14T00:00:00.000Z", updatedAt: "2026-08-14T00:00:00.000Z",
    };
    const dto = toPublicProjectListing(record);
    expect(dto).not.toHaveProperty("id");
    expect(dto).not.toHaveProperty("published");
    expect(dto).not.toHaveProperty("createdAt");
    expect(dto).not.toHaveProperty("updatedAt");
    expect(JSON.stringify(dto)).not.toContain("secret-id");
  });

  it("news: toPublicNewsArticle strips id/published/createdAt/updatedAt", () => {
    const record: NewsRecord = {
      id: "custom:secret-id", slug: "bai-viet-test", title: "Tiêu đề", category: "Kinh nghiệm",
      publishedAt: "2026-08-14", readMinutes: 5, excerpt: "", sections: [], cover: "",
      published: true, createdAt: "2026-08-14T00:00:00.000Z", updatedAt: "2026-08-14T00:00:00.000Z",
    };
    const dto = toPublicNewsArticle(record);
    expect(dto).not.toHaveProperty("id");
    expect(dto).not.toHaveProperty("published");
    expect(dto).not.toHaveProperty("createdAt");
    expect(dto).not.toHaveProperty("updatedAt");
    expect(JSON.stringify(dto)).not.toContain("secret-id");
  });
});

describe("guessing an unpublished/hidden slug cannot retrieve it through the public data path", () => {
  // Every public detail page (cho-thue/[slug], du-an/[slug], tin-tuc/[slug])
  // finds its record by slug INSIDE the already-published-filtered public
  // array, never against the raw admin list — so an unpublished/hidden
  // record's slug is structurally unreachable, not just hidden by a UI
  // check that a crafted request could route around.
  it("an unpublished project is absent from toPublicProjectListings regardless of slug", () => {
    const hidden: ProjectRecord = {
      id: "custom:hidden-project", slug: "hidden-project", name: "Nội bộ", location: "Hà Nội",
      investor: "N/A", status: "Đang triển khai", media: [], summary: "SECRET-SUMMARY", amenities: [],
      progressText: "", progressPercent: 0, published: false,
      createdAt: "2026-08-14T00:00:00.000Z", updatedAt: "2026-08-14T00:00:00.000Z",
    };
    const publicList = toPublicProjectListings([hidden]);
    expect(publicList.find((p) => p.slug === "hidden-project")).toBeUndefined();
  });

  it("an unpublished news article is absent from toPublicNewsArticles regardless of slug", () => {
    const hidden: NewsRecord = {
      id: "custom:hidden-article", slug: "hidden-article", title: "Nội bộ", category: "Kinh nghiệm",
      publishedAt: "", readMinutes: 0, excerpt: "SECRET-EXCERPT", sections: [], cover: "",
      published: false, createdAt: "2026-08-14T00:00:00.000Z", updatedAt: "2026-08-14T00:00:00.000Z",
    };
    const publicList = toPublicNewsArticles([hidden]);
    expect(publicList.find((a) => a.slug === "hidden-article")).toBeUndefined();
  });
});

describe("error messages never echo secrets", () => {
  afterEach(() => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD_HASH;
    delete process.env.AUTH_SECRET;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    delete process.env.GOOGLE_PRIVATE_KEY;
    delete process.env.GOOGLE_CMS_SPREADSHEET_ID;
    vi.resetModules();
  });

  it("login failure never echoes the submitted email, password, or the stored hash", async () => {
    process.env.ADMIN_EMAIL = "admin@ndthich.vn";
    process.env.ADMIN_PASSWORD_HASH =
      "scrypt:16384:8:1:2a1784af0ebb7caaadc7b97761632987:b0352ccc88ffec239a09af7c9147384268631b1b9cb3353f67faf8381fa0c422244be46d81a6eff610a71524e023e204e59b7ce2db36719d012a7fe66705e492";
    process.env.AUTH_SECRET = TEST_SECRET;
    const { loginAction } = await import("@/app/actions/auth");
    const formData = new FormData();
    formData.append("email", "admin@ndthich.vn");
    formData.append("password", "wrong-password-attempt-xyz");
    const result = await loginAction(formData);
    expect(result.ok).toBe(false);
    expect(result.error).not.toContain("wrong-password-attempt-xyz");
    expect(result.error).not.toContain("b0352ccc88ffec239a09af7c9147384268631b1b9cb3353f67faf8381fa0c422244be46d81a6eff610a71524e023e204e59b7ce2db36719d012a7fe66705e492");
    expect(result.error).not.toContain(process.env.AUTH_SECRET);
  });

  it("a missing-Google-env error names the env var, never a value", () => {
    expect(getGoogleServiceAccountEnv()).toBeNull();
    expect(() => requireGoogleServiceAccountEnv()).toThrowError(/GOOGLE_SERVICE_ACCOUNT_EMAIL|GOOGLE_PRIVATE_KEY/);
    expect(() => requireGoogleSpreadsheetEnv()).toThrowError(/GOOGLE_CMS_SPREADSHEET_ID/);
  });

  it("a configured Google private key never appears in any thrown error message", () => {
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "svc@example.iam.gserviceaccount.com";
    process.env.GOOGLE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\\nSUPER-SECRET-KEY-MATERIAL\\n-----END PRIVATE KEY-----";
    let message = "";
    try {
      requireGoogleSpreadsheetEnv();
    } catch (err) {
      message = (err as Error).message;
    }
    expect(message).not.toContain("SUPER-SECRET-KEY-MATERIAL");
  });
});

describe("the raw rental source sheet has no write path in application runtime", () => {
  it("RentalSourceProvider only exposes listRawRows — structurally read-only", async () => {
    const { GoogleRentalSource } = await import("@/lib/server/rental/source");
    const instance = new GoogleRentalSource();
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).filter(
      (name) => name !== "constructor",
    );
    expect(methodNames).toEqual(["listRawRows"]);
  });
});

describe("contact form input length limits", () => {
  it("rejects a name over 120 characters", () => {
    const result = validateContactForm({
      name: "A".repeat(121),
      phone: "0912345678",
      need: "",
      area: "",
      message: "",
    });
    expect(result.errors.name).toBeDefined();
  });

  it("truncates (never rejects) an over-long free-text field instead of storing it unbounded", () => {
    const result = validateContactForm({
      name: "Nguyễn Văn A",
      phone: "0912345678",
      need: "x".repeat(600),
      area: "y".repeat(600),
      message: "z".repeat(3000),
    });
    expect(result.value!.need.length).toBeLessThanOrEqual(500);
    expect(result.value!.area.length).toBeLessThanOrEqual(500);
    expect(result.value!.message.length).toBeLessThanOrEqual(2000);
  });
});
