import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const put = vi.fn();
const del = vi.fn();
vi.mock("@vercel/blob", () => ({
  put: (...args: unknown[]) => put(...args),
  del: (...args: unknown[]) => del(...args),
}));

const BLOB_URL = "https://abc123.public.blob.vercel-storage.com/media/e1f2.png";

let VercelBlobStore: typeof import("@/lib/server/media/blobStore").VercelBlobStore;

beforeEach(async () => {
  ({ VercelBlobStore } = await import("@/lib/server/media/blobStore"));
  put.mockReset();
  del.mockReset();
  // The real SDK returns a promise; remove() attaches .catch to it.
  del.mockResolvedValue(undefined);
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("VercelBlobStore", () => {
  it("uploads and reports the CDN url so images skip the proxy route", async () => {
    put.mockResolvedValue({ url: BLOB_URL, downloadUrl: BLOB_URL, pathname: "media/e1f2.png" });

    const stored = await new VercelBlobStore().put("media:x", "anh.png", {
      buffer: Buffer.from("bytes"),
      mimeType: "image/png",
    });

    expect(stored.driveFileId).toBe(BLOB_URL);
    expect(stored.publicUrl).toBe(BLOB_URL);
    const [pathname, , options] = put.mock.calls[0]!;
    expect(pathname).toMatch(/^media\/[0-9a-f-]{36}\.png$/);
    expect(options).toMatchObject({ access: "public", contentType: "image/png" });
  });

  it("names the stored file itself rather than trusting the upload's filename", async () => {
    put.mockResolvedValue({ url: BLOB_URL, downloadUrl: BLOB_URL, pathname: "x" });

    await new VercelBlobStore().put("media:x", "../../etc/passwd", {
      buffer: Buffer.from("b"),
      mimeType: "image/jpeg",
    });

    const [pathname] = put.mock.calls[0]!;
    expect(pathname).not.toContain("..");
    expect(pathname).toMatch(/^media\/[0-9a-f-]{36}\.jpg$/);
  });

  it("rejects a media type the CMS does not accept", async () => {
    await expect(
      new VercelBlobStore().put("media:x", "evil.svg", {
        buffer: Buffer.from("<svg/>"),
        mimeType: "image/svg+xml",
      }),
    ).rejects.toThrow(/Unsupported media type/);
    expect(put).not.toHaveBeenCalled();
  });

  it("reads bytes back from a stored blob url", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => new TextEncoder().encode("bytes").buffer,
        headers: new Headers({ "content-type": "image/png" }),
      }),
    );

    const blob = await new VercelBlobStore().get(BLOB_URL);

    expect(blob?.mimeType).toBe("image/png");
    expect(blob?.buffer.toString()).toBe("bytes");
  });

  // driveFileId round-trips through the CMS spreadsheet, which an operator can
  // hand-edit — fetching whatever it says, server-side, would be an SSRF hole.
  it.each([
    "https://evil.example.com/payload",
    "http://169.254.169.254/latest/meta-data/",
    "file:///etc/passwd",
    "https://abc.public.blob.vercel-storage.com.evil.com/x.png",
    "not-a-url",
  ])("refuses to fetch %s", async (hostile) => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    expect(await new VercelBlobStore().get(hostile)).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("refuses to delete anything outside the blob store", async () => {
    await new VercelBlobStore().remove("https://evil.example.com/x");
    expect(del).not.toHaveBeenCalled();

    await new VercelBlobStore().remove(BLOB_URL);
    expect(del).toHaveBeenCalledWith(BLOB_URL);
  });

  it("returns null when the blob is gone instead of throwing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    expect(await new VercelBlobStore().get(BLOB_URL)).toBeNull();
  });
});
