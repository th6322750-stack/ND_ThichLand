import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LocalDiskBlobStore } from "@/lib/server/media/blobStore";

let dir: string;

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "ndthich-blobstore-"));
});

afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

describe("LocalDiskBlobStore", () => {
  it("round-trips a file through the disk with its mime type intact", async () => {
    const store = new LocalDiskBlobStore(dir);
    const buffer = Buffer.from("fake-png-bytes");

    const { driveFileId } = await store.put("media:whatever", "anh.png", { buffer, mimeType: "image/png" });
    const read = await store.get(driveFileId);

    expect(read?.mimeType).toBe("image/png");
    expect(read?.buffer.toString()).toBe("fake-png-bytes");
  });

  it("creates the directory on first write rather than failing", async () => {
    const nested = path.join(dir, "does", "not", "exist", "yet");
    const store = new LocalDiskBlobStore(nested);

    const { driveFileId } = await store.put("media:x", "a.webp", {
      buffer: Buffer.from("x"),
      mimeType: "image/webp",
    });

    expect(await store.get(driveFileId)).not.toBeNull();
  });

  it("never derives the stored name from caller input", async () => {
    const store = new LocalDiskBlobStore(dir);
    const { driveFileId } = await store.put("media:../../etc/passwd", "../../etc/passwd", {
      buffer: Buffer.from("x"),
      mimeType: "image/png",
    });

    expect(driveFileId).toMatch(/^[0-9a-f-]{36}\.png$/);
    expect(driveFileId).not.toContain("..");
    expect(await fs.readdir(dir)).toEqual([driveFileId]);
  });

  // driveFileId round-trips through the CMS spreadsheet, which an operator can
  // hand-edit — a traversal string there must not reach the filesystem.
  it.each([
    "../../../etc/passwd",
    "..\\..\\windows\\system32\\config\\sam",
    "/etc/shadow",
    "not-a-uuid.png",
    "3f8c1e4a-0000-4000-8000-000000000000.exe",
  ])("refuses to read %s", async (hostile) => {
    const store = new LocalDiskBlobStore(dir);
    expect(await store.get(hostile)).toBeNull();
  });

  it("ignores a delete for a name it did not write", async () => {
    const store = new LocalDiskBlobStore(dir);
    await expect(store.remove("../../etc/passwd")).resolves.toBeUndefined();
    await expect(store.remove("3f8c1e4a-0000-4000-8000-000000000000.png")).resolves.toBeUndefined();
  });

  it("returns null for a record whose file is gone", async () => {
    const store = new LocalDiskBlobStore(dir);
    const { driveFileId } = await store.put("media:x", "a.jpg", {
      buffer: Buffer.from("x"),
      mimeType: "image/jpeg",
    });
    await store.remove(driveFileId);

    expect(await store.get(driveFileId)).toBeNull();
  });

  it("rejects a media type the CMS does not accept", async () => {
    const store = new LocalDiskBlobStore(dir);
    await expect(
      store.put("media:x", "evil.svg", { buffer: Buffer.from("<svg/>"), mimeType: "image/svg+xml" }),
    ).rejects.toThrow(/Unsupported media type/);
  });
});
