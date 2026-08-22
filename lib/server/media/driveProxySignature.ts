import { createHmac, timingSafeEqual } from "node:crypto";

export function signDriveMediaFileId(fileId: string, secret: string): string {
  return createHmac("sha256", secret).update(fileId).digest("hex");
}

export function verifyDriveMediaSignature(fileId: string, signature: string, secret: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;

  const expected = Buffer.from(signDriveMediaFileId(fileId, secret), "hex");
  const supplied = Buffer.from(signature, "hex");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
