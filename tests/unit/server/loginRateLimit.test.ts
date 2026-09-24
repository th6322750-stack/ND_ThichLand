import { beforeEach, describe, expect, it } from "vitest";
import {
  clearLoginFailures,
  isLoginRateLimited,
  loginRateLimitKey,
  recordLoginFailure,
} from "@/lib/server/auth/loginRateLimit";

describe("admin login rate limiting", () => {
  const key = loginRateLimitKey("203.0.113.8", "test-secret");

  beforeEach(() => clearLoginFailures(key));

  it("stores only an HMAC key and blocks after eight failures", () => {
    expect(key).not.toContain("203.0.113.8");
    for (let i = 0; i < 7; i += 1) recordLoginFailure(key, 1_000);
    expect(isLoginRateLimited(key, 1_001)).toBe(false);
    recordLoginFailure(key, 1_000);
    expect(isLoginRateLimited(key, 1_001)).toBe(true);
  });

  it("clears a successful client's failure history", () => {
    for (let i = 0; i < 8; i += 1) recordLoginFailure(key, 1_000);
    clearLoginFailures(key);
    expect(isLoginRateLimited(key, 1_001)).toBe(false);
  });
});
