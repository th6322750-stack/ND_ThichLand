import { describe, it, expect, vi, beforeEach } from "vitest";
import { InMemorySiteSettingsRepository } from "@/lib/server/settings/repository";
import { DEFAULT_SITE_SETTINGS, mapQueryOf, telHref } from "@/lib/data/siteSettings";
import type { SiteSettings } from "@/lib/types";

const FILLED: SiteSettings = {
  address: "12 Lê Lợi, Quận 1, TP. HCM",
  mapQuery: "10.7769, 106.7009",
  phonePrimary: "0900 111 222",
  phoneSecondary: "",
  email: "a@b.vn",
  hoursWeekday: "T2-T6: 9:00 - 17:00",
  hoursWeekend: "",
  profilePdfUrl: "",
};

describe("site settings", () => {
  it("serves the shipped defaults before anything has been saved", async () => {
    const repo = new InMemorySiteSettingsRepository();
    expect(await repo.get()).toEqual(DEFAULT_SITE_SETTINGS);
  });

  it("round-trips a saved record", async () => {
    const repo = new InMemorySiteSettingsRepository();
    await repo.save(FILLED);
    expect(await repo.get()).toEqual(FILLED);
  });

  it("lets an operator clear the optional second phone and weekend hours", async () => {
    const repo = new InMemorySiteSettingsRepository();
    await repo.save(FILLED);
    const saved = await repo.get();
    // These must stay empty rather than falling back to the defaults —
    // otherwise a removed second hotline would silently reappear.
    expect(saved.phoneSecondary).toBe("");
    expect(saved.hoursWeekend).toBe("");
  });

  it("maps to the address when no explicit map query is set", () => {
    expect(mapQueryOf({ ...FILLED, mapQuery: "" })).toBe(FILLED.address);
    expect(mapQueryOf({ ...FILLED, mapQuery: "   " })).toBe(FILLED.address);
  });

  it("prefers an explicit map query over the display address", () => {
    expect(mapQueryOf(FILLED)).toBe("10.7769, 106.7009");
  });

  it("strips formatting from phone numbers for tel: links", () => {
    expect(telHref("0986 602 203")).toBe("0986602203");
    expect(telHref("(028) 3822-1234")).toBe("02838221234");
  });
});

describe("saveSiteSettingsAction", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  async function loadAction(session: unknown) {
    vi.doMock("@/lib/server/auth/dal", () => ({ getSession: vi.fn().mockResolvedValue(session) }));
    vi.doMock("next/cache", () => ({ revalidatePath: vi.fn() }));
    return import("@/app/actions/settings");
  }

  it("refuses to write when there is no session", async () => {
    const { saveSiteSettingsAction } = await loadAction(null);
    const result = await saveSiteSettingsAction(FILLED);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/đăng nhập/i);
  });

  it("rejects a blank address and an invalid email", async () => {
    const { saveSiteSettingsAction } = await loadAction({ sub: "admin@x.vn", role: "admin" });
    const result = await saveSiteSettingsAction({ ...FILLED, address: "  ", email: "not-an-email" });
    expect(result.ok).toBe(false);
    expect(result.fieldErrors?.address).toBeTruthy();
    expect(result.fieldErrors?.email).toBeTruthy();
  });

  it("accepts a valid record from a signed-in admin", async () => {
    const { saveSiteSettingsAction } = await loadAction({ sub: "admin@x.vn", role: "admin" });
    const result = await saveSiteSettingsAction(FILLED);
    expect(result.ok).toBe(true);
  });
});

describe("hồ sơ năng lực upload", () => {
  it("ships the company's own real profile as a static-asset default — not an admin upload that only lives in one serverless instance's memory", () => {
    expect(DEFAULT_SITE_SETTINGS.profilePdfUrl).toBe("/assets/v2/profile/ho-so-nang-luc-ndthich.pdf");
  });

  it("round-trips an uploaded profile url", async () => {
    const repo = new InMemorySiteSettingsRepository();
    await repo.save({ ...FILLED, profilePdfUrl: "https://drive/abc.pdf" });
    expect((await repo.get()).profilePdfUrl).toBe("https://drive/abc.pdf");
  });

  it("lets an operator take the profile back down", async () => {
    const repo = new InMemorySiteSettingsRepository();
    await repo.save({ ...FILLED, profilePdfUrl: "https://drive/abc.pdf" });
    await repo.save({ ...FILLED, profilePdfUrl: "" });
    expect((await repo.get()).profilePdfUrl).toBe("");
  });
});
