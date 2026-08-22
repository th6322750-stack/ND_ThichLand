import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const VERSION = "v1";

function encryptionKey(authSecret: string): Buffer {
  return createHash("sha256").update(`ndthich-admin-totp:${authSecret}`, "utf8").digest();
}

/** AES-256-GCM keeps a leaked CMS sheet from exposing the Authenticator seed. */
export function encryptServerSecret(plaintext: string, authSecret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(authSecret), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(":");
}

export function decryptServerSecret(value: string, authSecret: string): string | null {
  const [version, ivB64, tagB64, ciphertextB64, ...rest] = value.split(":");
  if (version !== VERSION || !ivB64 || !tagB64 || !ciphertextB64 || rest.length > 0) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(authSecret), Buffer.from(ivB64, "base64url"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextB64, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}
