import { describe, expect, it } from "vitest";
import { encryptServerSecret, decryptServerSecret } from "@/lib/server/crypto/encryptedSecret";
import { base32Encode, buildTotpUri, generateTotpCode, verifyTotpCode } from "@/lib/server/crypto/totp";
import { createTotpSetupToken, verifyTotpSetupToken } from "@/lib/server/crypto/totpSetupToken";

const RFC_SECRET = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

describe("admin security crypto", () => {
  it("matches the RFC 6238 SHA-1 vector (last six digits)", () => {
    expect(base32Encode(Buffer.from("12345678901234567890", "ascii"))).toBe(RFC_SECRET);
    expect(generateTotpCode(RFC_SECRET, 59_000)).toBe("287082");
    expect(verifyTotpCode("287082", RFC_SECRET, 59_000, 0)).toBe(true);
    expect(verifyTotpCode("287083", RFC_SECRET, 59_000, 0)).toBe(false);
  });

  it("builds a standard otpauth URI without exposing anything except the intended seed", () => {
    const uri = buildTotpUri(RFC_SECRET, "admin@ndthich.vn");
    expect(uri).toMatch(/^otpauth:\/\/totp\//);
    expect(uri).toContain(`secret=${RFC_SECRET}`);
    expect(uri).toContain("issuer=NDTHICH+LAND");
    expect(uri).toContain("period=30");
  });

  it("encrypts the seed with authenticated encryption and rejects tampering/wrong keys", () => {
    const encrypted = encryptServerSecret(RFC_SECRET, "auth-secret-a");
    expect(encrypted).not.toContain(RFC_SECRET);
    expect(decryptServerSecret(encrypted, "auth-secret-a")).toBe(RFC_SECRET);
    expect(decryptServerSecret(encrypted, "auth-secret-b")).toBeNull();
    expect(decryptServerSecret(`${encrypted}x`, "auth-secret-a")).toBeNull();
  });

  it("signs a short-lived setup token and rejects a changed signature", () => {
    const token = createTotpSetupToken(
      { sub: "admin@ndthich.vn", secret: RFC_SECRET, exp: Date.now() + 60_000, stateVersion: "bootstrap" },
      "auth-secret-a",
    );
    expect(verifyTotpSetupToken(token, "auth-secret-a")?.secret).toBe(RFC_SECRET);
    expect(verifyTotpSetupToken(`${token}x`, "auth-secret-a")).toBeNull();
  });
});
