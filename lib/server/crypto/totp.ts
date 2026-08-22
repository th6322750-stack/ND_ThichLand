import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const PERIOD_SECONDS = 30;
const DIGITS = 6;

export function base32Encode(input: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of input) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

function base32Decode(raw: string): Buffer | null {
  const input = raw.toUpperCase().replace(/=+$/g, "").replace(/[\s-]/g, "");
  if (!input || /[^A-Z2-7]/.test(input)) return null;
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of input) {
    value = (value << 5) | BASE32_ALPHABET.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function isValidTotpSecret(secret: string): boolean {
  const decoded = base32Decode(secret);
  return decoded !== null && decoded.length >= 16;
}

export function generateTotpCode(secret: string, nowMs = Date.now()): string | null {
  const key = base32Decode(secret);
  if (!key) return null;
  const counter = Math.floor(nowMs / 1000 / PERIOD_SECONDS);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", key).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(binary % 10 ** DIGITS).padStart(DIGITS, "0");
}

export function verifyTotpCode(code: string, secret: string, nowMs = Date.now(), window = 1): boolean {
  const normalized = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(normalized)) return false;
  const received = Buffer.from(normalized, "utf8");
  for (let step = -window; step <= window; step += 1) {
    const expected = generateTotpCode(secret, nowMs + step * PERIOD_SECONDS * 1000);
    if (expected && timingSafeEqual(received, Buffer.from(expected, "utf8"))) return true;
  }
  return false;
}

export function buildTotpUri(secret: string, email: string): string {
  const issuer = "NDTHICH LAND";
  const label = `${issuer}:${email}`;
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(PERIOD_SECONDS),
  });
  return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
}
