import { describe, it, expect } from "vitest";
import { resolveLegacyMediaLink, MEDIA_PLACEHOLDER } from "@/lib/server/media/legacyResolve";

describe("resolveLegacyMediaLink", () => {
  it("returns no media for an empty link", async () => {
    const result = await resolveLegacyMediaLink("");
    expect(result.media).toEqual([]);
    expect(result.diagnostic).toBeUndefined();
  });

  it("falls back to the placeholder with a diagnostic for a Google Photos album link", async () => {
    const result = await resolveLegacyMediaLink("https://photos.app.goo.gl/abc123");
    expect(result.media).toEqual([MEDIA_PLACEHOLDER]);
    expect(result.diagnostic).toMatch(/Photos/);
  });

  it("falls back to the placeholder with a diagnostic for an unrecognized link format", async () => {
    const result = await resolveLegacyMediaLink("not a url at all");
    expect(result.media).toEqual([MEDIA_PLACEHOLDER]);
    expect(result.diagnostic).toMatch(/không nhận diện/i);
  });

  it("falls back to the placeholder when Google runtime is not configured, even for a valid Drive link", async () => {
    delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    delete process.env.GOOGLE_PRIVATE_KEY;
    delete process.env.GOOGLE_CMS_SPREADSHEET_ID;
    const result = await resolveLegacyMediaLink("https://drive.google.com/file/d/abcDEF123/view");
    expect(result.media).toEqual([MEDIA_PLACEHOLDER]);
    expect(result.diagnostic).toMatch(/chưa cấu hình/i);
  });

  it("never fails the whole listing — always resolves, never rejects", async () => {
    await expect(resolveLegacyMediaLink("https://drive.google.com/drive/folders/xyz")).resolves.toBeDefined();
  });
});
