import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

interface TotpSetupPayload {
  sub: string;
  secret: string;
  exp: number;
  stateVersion: string;
}

function sign(payload: string, authSecret: string): string {
  return createHmac("sha256", authSecret).update(`totp-setup:${payload}`).digest("base64url");
}

export function createTotpSetupToken(payload: TotpSetupPayload, authSecret: string): string {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${encoded}.${sign(encoded, authSecret)}`;
}

export function verifyTotpSetupToken(token: string, authSecret: string): TotpSetupPayload | null {
  const [encoded, signature, ...rest] = token.split(".");
  if (!encoded || !signature || rest.length) return null;
  const expected = Buffer.from(sign(encoded, authSecret), "base64url");
  const received = Buffer.from(signature, "base64url");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as TotpSetupPayload;
    if (
      typeof payload.sub !== "string" ||
      typeof payload.secret !== "string" ||
      typeof payload.exp !== "number" ||
      typeof payload.stateVersion !== "string" ||
      payload.exp < Date.now()
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
