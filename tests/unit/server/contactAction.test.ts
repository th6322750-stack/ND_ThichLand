import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const headerStore = new Map<string, string>();
vi.mock("next/headers", () => ({ headers: async () => ({ get: (name: string) => headerStore.get(name) ?? null }) }));

const baseInput = {
  name: "Nguyễn Văn A",
  phone: "0912345678",
  need: "Thuê căn hộ",
  area: "Hà Nội",
  message: "Cần tư vấn thêm",
  website: "",
};

describe("submitContactAction", () => {
  beforeEach(() => {
    headerStore.clear();
    headerStore.set("x-forwarded-for", "203.0.113.10");
    process.env.RATE_LIMIT_SECRET = "test-rate-limit-secret";
    // These are deliberately globalThis-anchored (see rateLimit.ts/providers.ts) so
    // they survive vi.resetModules() in production — reset them by hand here instead.
    delete (globalThis as Record<symbol, unknown>)[Symbol.for("ndthich.gd6.contactRateLimit")];
    delete (globalThis as Record<symbol, unknown>)[Symbol.for("ndthich.gd6.contactRepository")];
  });

  afterEach(() => {
    delete process.env.RATE_LIMIT_SECRET;
    vi.resetModules();
  });

  it("rejects missing name/phone with field errors", async () => {
    const { submitContactAction } = await import("@/app/actions/contact");
    const result = await submitContactAction({ ...baseInput, name: "", phone: "" });
    expect(result.ok).toBe(false);
    expect(result.fieldErrors).toMatchObject({ name: expect.any(String), phone: expect.any(String) });
  });

  it("rejects an invalid phone number", async () => {
    const { submitContactAction } = await import("@/app/actions/contact");
    const result = await submitContactAction({ ...baseInput, phone: "abc" });
    expect(result.ok).toBe(false);
    expect(result.fieldErrors?.phone).toBeDefined();
  });

  it("normalizes a +84-prefixed phone and persists the submission", async () => {
    const { submitContactAction } = await import("@/app/actions/contact");
    const { getContactRepository } = await import("@/lib/server/contact/providers");
    const result = await submitContactAction({ ...baseInput, phone: "+84912345678" });
    expect(result.ok).toBe(true);
    const repo = await getContactRepository();
    const records = await repo.list();
    expect(records.some((r) => r.phone === "0912345678")).toBe(true);
  });

  it("never stores the raw IP — only an HMAC hash", async () => {
    const { submitContactAction } = await import("@/app/actions/contact");
    const { getContactRepository } = await import("@/lib/server/contact/providers");
    await submitContactAction(baseInput);
    const repo = await getContactRepository();
    const records = await repo.list();
    // Non-null: submitContactAction above just added one.
    const last = records[records.length - 1]!;
    expect(last.ipHash).not.toBe("203.0.113.10");
    expect(last.ipHash).not.toContain("203.0.113");
    expect(last.ipHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("silently accepts (without persisting) when the honeypot field is filled", async () => {
    const { submitContactAction } = await import("@/app/actions/contact");
    const { getContactRepository } = await import("@/lib/server/contact/providers");
    const before = (await (await getContactRepository()).list()).length;
    const result = await submitContactAction({ ...baseInput, website: "http://spam.example" });
    expect(result.ok).toBe(true);
    const after = (await (await getContactRepository()).list()).length;
    expect(after).toBe(before);
  });

  it("rate-limits repeated submissions from the same IP", async () => {
    const { submitContactAction } = await import("@/app/actions/contact");
    await submitContactAction(baseInput);
    await submitContactAction(baseInput);
    await submitContactAction(baseInput);
    const fourth = await submitContactAction(baseInput);
    expect(fourth.ok).toBe(false);
  });

  it("a different IP is not affected by another IP's rate limit", async () => {
    const { submitContactAction } = await import("@/app/actions/contact");
    await submitContactAction(baseInput);
    await submitContactAction(baseInput);
    await submitContactAction(baseInput);
    headerStore.set("x-forwarded-for", "198.51.100.20");
    const result = await submitContactAction(baseInput);
    expect(result.ok).toBe(true);
  });
});
