import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionToken } from "@/lib/server/crypto/session";
import { DEFAULT_ABOUT_PAGE_CONTENT, DEFAULT_CONTACT_PAGE_CONTENT } from "@/lib/data/pageContent";

const cookieJar = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => cookieJar.has(name) ? { name, value: cookieJar.get(name)! } : undefined,
  }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const AUTH_SECRET = "page-content-actions-auth-secret";

function signIn() {
  const now = Date.now();
  cookieJar.set(
    "ndthich_admin_session",
    createSessionToken({ sub: "admin@ndthich.vn", role: "admin", iat: now, exp: now + 60_000 }, AUTH_SECRET),
  );
}

describe("page content actions", () => {
  beforeEach(() => {
    vi.resetModules();
    cookieJar.clear();
    process.env.ADMIN_EMAIL = "admin@ndthich.vn";
    process.env.ADMIN_PASSWORD_HASH = "scrypt:1:1:1:00:00";
    process.env.AUTH_SECRET = AUTH_SECRET;
  });

  afterEach(() => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD_HASH;
    delete process.env.AUTH_SECRET;
  });

  it("rejects an unauthenticated page edit", async () => {
    const { saveAboutPageContentAction } = await import("@/app/actions/pageContent");
    expect((await saveAboutPageContentAction(DEFAULT_ABOUT_PAGE_CONTENT)).ok).toBe(false);
  });

  it("validates required fields instead of saving a broken public page", async () => {
    signIn();
    const { saveContactPageContentAction } = await import("@/app/actions/pageContent");
    const result = await saveContactPageContentAction({ ...DEFAULT_CONTACT_PAGE_CONTENT, heroTitle: "" });
    expect(result.ok).toBe(false);
    expect(result.fieldErrors?.heroTitle).toBeTruthy();
  });

  it("persists an authenticated edit and returns it through the public repository", async () => {
    signIn();
    const { saveAboutPageContentAction } = await import("@/app/actions/pageContent");
    const result = await saveAboutPageContentAction({ ...DEFAULT_ABOUT_PAGE_CONTENT, heroTitle: "Giới thiệu đã chỉnh" });
    expect(result.ok).toBe(true);
    const { getPageContentRepository } = await import("@/lib/server/pageContent/providers");
    expect((await (await getPageContentRepository()).get("about")).heroTitle).toBe("Giới thiệu đã chỉnh");
  });
});
