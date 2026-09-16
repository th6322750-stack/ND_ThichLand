import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadMediaImage, downloadMediaZip, mediaFileName } from "@/lib/downloadMedia";

const createObjectURL = vi.fn(() => "blob:fake");
const revokeObjectURL = vi.fn();

beforeEach(() => {
  createObjectURL.mockClear();
  revokeObjectURL.mockClear();
  // jsdom implements neither, and every save path goes through both.
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectURL });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function imageResponse(type = "image/png") {
  return { ok: true, blob: async () => new Blob(["bytes"], { type }) };
}

describe("mediaFileName", () => {
  it("names files after the listing, position and real type", () => {
    expect(mediaFileName("Căn hộ Đống Đa", 0, "image/jpeg")).toBe("can-ho-dong-da-01.jpg");
    expect(mediaFileName("Căn hộ Đống Đa", 9, "image/webp")).toBe("can-ho-dong-da-10.webp");
  });

  it("falls back to jpg for a type it does not know", () => {
    expect(mediaFileName("Nhà A", 0, "application/octet-stream")).toBe("nha-a-01.jpg");
    expect(mediaFileName("Nhà A", 0)).toBe("nha-a-01.jpg");
  });

  it("survives a name with nothing sluggable in it", () => {
    expect(mediaFileName("!!!", 0, "image/png")).toBe("anh-01.png");
  });
});

describe("downloadMediaImage", () => {
  it("fetches the bytes and saves them under a readable name", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(imageResponse("image/png")));
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    const ok = await downloadMediaImage("https://x.public.blob.vercel-storage.com/media/a.png", "Căn hộ A", 0);

    expect(ok).toBe(true);
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    click.mockRestore();
  });

  it("reports failure instead of saving an empty file when the fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    expect(await downloadMediaImage("https://x/a.png", "Căn hộ A", 0)).toBe(false);
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it("treats a non-ok response as a failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));

    expect(await downloadMediaImage("https://x/gone.png", "Căn hộ A", 0)).toBe(false);
  });
});

describe("downloadMediaZip", () => {
  it("bundles every photo into one archive", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(imageResponse("image/jpeg")));
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    const result = await downloadMediaZip(["https://x/1.jpg", "https://x/2.jpg"], "Dự án B");

    expect(result).toEqual({ saved: 2, failed: 0 });
    expect(click).toHaveBeenCalledOnce();
    click.mockRestore();
  });

  // One dead URL in an old listing must not cost the visitor the other photos.
  it("skips the photos that fail and still delivers the rest", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(imageResponse("image/jpeg"))
      .mockResolvedValueOnce({ ok: false, status: 404 });
    vi.stubGlobal("fetch", fetchMock);
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    expect(await downloadMediaZip(["https://x/1.jpg", "https://x/gone.jpg"], "Dự án B")).toEqual({
      saved: 1,
      failed: 1,
    });
    expect(click).toHaveBeenCalledOnce();
    click.mockRestore();
  });

  it("saves nothing at all when every photo fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    expect(await downloadMediaZip(["https://x/1.jpg"], "Dự án B")).toEqual({ saved: 0, failed: 1 });
    expect(click).not.toHaveBeenCalled();
    click.mockRestore();
  });
});
