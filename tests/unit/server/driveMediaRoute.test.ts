import { beforeEach, describe, expect, it, vi } from "vitest";
import { signDriveMediaFileId } from "@/lib/server/media/driveProxySignature";

const { getDriveFileStreamMock, streamToBufferMock, runtimeConfiguredMock, proxySecretMock } = vi.hoisted(() => ({
  getDriveFileStreamMock: vi.fn(),
  streamToBufferMock: vi.fn(),
  runtimeConfiguredMock: vi.fn(),
  proxySecretMock: vi.fn(),
}));

vi.mock("@/lib/server/env", () => ({
  isGoogleRuntimeConfigured: runtimeConfiguredMock,
  getDriveMediaProxySecret: proxySecretMock,
}));

vi.mock("@/lib/server/google/drive", () => ({
  getDriveFileStream: getDriveFileStreamMock,
  streamToBuffer: streamToBufferMock,
}));

import { GET } from "@/app/api/drive-media/[fileId]/route";

const FILE_ID = "1AbCdEfGhIjKlMnOpQrStUv";
const SECRET = "drive-proxy-test-secret";

function request(signature?: string) {
  const suffix = signature ? `?sig=${signature}` : "";
  return GET(new Request(`http://localhost/api/drive-media/${FILE_ID}${suffix}`), {
    params: Promise.resolve({ fileId: FILE_ID }),
  });
}

describe("GET /api/drive-media/[fileId]", () => {
  beforeEach(() => {
    getDriveFileStreamMock.mockReset();
    streamToBufferMock.mockReset();
    runtimeConfiguredMock.mockReturnValue(true);
    proxySecretMock.mockReturnValue(SECRET);
  });

  it("rejects unsigned and incorrectly signed Drive IDs before contacting Google", async () => {
    expect((await request()).status).toBe(404);
    expect((await request("0".repeat(64))).status).toBe(404);
    expect(getDriveFileStreamMock).not.toHaveBeenCalled();
  });

  it("fails closed when the proxy signing secret is unavailable", async () => {
    proxySecretMock.mockReturnValue(null);

    expect((await request(signDriveMediaFileId(FILE_ID, SECRET))).status).toBe(404);
    expect(getDriveFileStreamMock).not.toHaveBeenCalled();
  });

  it("serves a correctly signed public media URL", async () => {
    const stream = {};
    getDriveFileStreamMock.mockResolvedValue({ stream, mimeType: "image/png" });
    streamToBufferMock.mockResolvedValue(Buffer.from("image-bytes"));

    const response = await request(signDriveMediaFileId(FILE_ID, SECRET));

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(getDriveFileStreamMock).toHaveBeenCalledWith(FILE_ID);
    expect(streamToBufferMock).toHaveBeenCalledWith(stream);
  });
});
