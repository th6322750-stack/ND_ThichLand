import { describe, it, expect, vi } from "vitest";
import { createSessionToken, verifySessionToken } from "@/lib/server/crypto/session";

const SECRET = "test-auth-secret";

function futurePayload(ms = 60_000) {
  const now = Date.now();
  return { sub: "admin@ndthich.vn", role: "admin" as const, iat: now, exp: now + ms };
}

describe("session token sign/verify", () => {
  it("round-trips a valid session", () => {
    const payload = futurePayload();
    const token = createSessionToken(payload, SECRET);
    expect(verifySessionToken(token, SECRET)).toEqual(payload);
  });

  it("rejects a token signed with a different secret", () => {
    const token = createSessionToken(futurePayload(), SECRET);
    expect(verifySessionToken(token, "wrong-secret")).toBeNull();
  });

  it("rejects a tampered payload (signature no longer matches)", () => {
    const token = createSessionToken(futurePayload(), SECRET);
    const [payloadB64, signature] = token.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({ sub: "attacker@evil.com", role: "admin", iat: Date.now(), exp: Date.now() + 60_000 }),
      "utf8",
    ).toString("base64url");
    expect(verifySessionToken(`${tamperedPayload}.${signature}`, SECRET)).toBeNull();
    void payloadB64;
  });

  it("rejects an expired session", () => {
    const expired = { sub: "admin@ndthich.vn", role: "admin" as const, iat: Date.now() - 120_000, exp: Date.now() - 1000 };
    const token = createSessionToken(expired, SECRET);
    expect(verifySessionToken(token, SECRET)).toBeNull();
  });

  it("rejects a malformed token", () => {
    expect(verifySessionToken("not-a-real-token", SECRET)).toBeNull();
    expect(verifySessionToken("", SECRET)).toBeNull();
    expect(verifySessionToken("a.b.c", SECRET)).toBeNull();
  });

  it("respects remember-me by producing a longer-lived expiry", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    const short = createSessionToken({ sub: "a@b.com", role: "admin", iat: now, exp: now + 60_000 }, SECRET);
    const long = createSessionToken({ sub: "a@b.com", role: "admin", iat: now, exp: now + 30 * 24 * 60 * 60_000 }, SECRET);
    const shortPayload = verifySessionToken(short, SECRET)!;
    const longPayload = verifySessionToken(long, SECRET)!;
    expect(longPayload.exp).toBeGreaterThan(shortPayload.exp);
    vi.useRealTimers();
  });
});
