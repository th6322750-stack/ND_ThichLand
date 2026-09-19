import { describe, it, expect } from "vitest";
import { validateMediaFile } from "@/lib/server/media/validate";

const MB = 1024 * 1024;

describe("validateMediaFile", () => {
  it("accepts the image and video types the CMS already allowed", () => {
    expect(validateMediaFile({ mimeType: "image/jpeg", sizeBytes: MB })).toBeNull();
    expect(validateMediaFile({ mimeType: "video/mp4", sizeBytes: 10 * MB })).toBeNull();
  });

  // Added so the "Hồ sơ năng lực" upload has something to accept.
  it("accepts a PDF", () => {
    expect(validateMediaFile({ mimeType: "application/pdf", sizeBytes: 5 * MB })).toBeNull();
  });

  it("rejects a PDF over 25MB with a message naming the real limit", () => {
    const err = validateMediaFile({ mimeType: "application/pdf", sizeBytes: 26 * MB });
    expect(err).toMatch(/25MB/);
  });

  it("still refuses formats nothing on the site can render", () => {
    expect(validateMediaFile({ mimeType: "application/zip", sizeBytes: MB })).toMatch(/không được hỗ trợ/i);
  });

  it("rejects an empty file", () => {
    expect(validateMediaFile({ mimeType: "image/png", sizeBytes: 0 })).toMatch(/rỗng/i);
  });
});
