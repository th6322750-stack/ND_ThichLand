import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { hashPassword } from "@/lib/server/crypto/passwords";
import { verifySessionToken } from "@/lib/server/crypto/session";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_DEFAULT_SECONDS, SESSION_MAX_AGE_REMEMBER_SECONDS } from "@/lib/authConstants";

interface StoredCookie {
  value: string;
  options: Record<string, unknown>;
}

const cookieJar = new Map<string, StoredCookie>();

const mockCookieStore = {
  get(name: string) {
    const entry = cookieJar.get(name);
    return entry ? { name, value: entry.value } : undefined;
  },
  set(name: string, value: string, options: Record<string, unknown>) {
    cookieJar.set(name, { value, options });
  },
  delete(name: string) {
    cookieJar.delete(name);
  },
  has(name: string) {
    return cookieJar.has(name);
  },
};

vi.mock("next/headers", () => ({
  cookies: async () => mockCookieStore,
  headers: async () => new Map<string, string>(),
}));

const TEST_EMAIL = "admin@ndthich.vn";
const TEST_PASSWORD = "S3cure-Test-Password!";
const TEST_SECRET = "test-auth-secret-value";

describe("loginAction / logoutAction", () => {
  beforeEach(async () => {
    cookieJar.clear();
    process.env.ADMIN_EMAIL = TEST_EMAIL;
    process.env.ADMIN_PASSWORD_HASH = await hashPassword(TEST_PASSWORD);
    process.env.AUTH_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD_HASH;
    delete process.env.AUTH_SECRET;
    vi.resetModules();
  });

  it("rejects wrong credentials with a generic message and sets no cookie", async () => {
    const { loginAction } = await import("@/app/actions/auth");
    const form = new FormData();
    form.set("email", TEST_EMAIL);
    form.set("password", "wrong-password");
    const result = await loginAction(form);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Email hoặc mật khẩu không đúng.");
    expect(cookieJar.has(SESSION_COOKIE_NAME)).toBe(false);
  });

  it("gives the exact same generic message for an unknown email (no enumeration)", async () => {
    const { loginAction } = await import("@/app/actions/auth");
    const form = new FormData();
    form.set("email", "someone-else@example.com");
    form.set("password", TEST_PASSWORD);
    const result = await loginAction(form);
    expect(result.error).toBe("Email hoặc mật khẩu không đúng.");
  });

  it("accepts correct credentials and sets a signed HttpOnly session cookie", async () => {
    const { loginAction } = await import("@/app/actions/auth");
    const form = new FormData();
    form.set("email", TEST_EMAIL);
    form.set("password", TEST_PASSWORD);
    const result = await loginAction(form);
    expect(result.ok).toBe(true);

    const cookie = cookieJar.get(SESSION_COOKIE_NAME);
    expect(cookie).toBeDefined();
    expect(cookie!.options.httpOnly).toBe(true);
    expect(cookie!.options.sameSite).toBe("lax");
    expect(cookie!.options.path).toBe("/");
    expect(cookie!.options.maxAge).toBe(SESSION_MAX_AGE_DEFAULT_SECONDS);

    const payload = verifySessionToken(cookie!.value, TEST_SECRET);
    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe(TEST_EMAIL);
    expect(payload!.role).toBe("admin");
  });

  it("remember-me sets a much longer maxAge", async () => {
    const { loginAction } = await import("@/app/actions/auth");
    const form = new FormData();
    form.set("email", TEST_EMAIL);
    form.set("password", TEST_PASSWORD);
    form.set("remember", "on");
    await loginAction(form);
    const cookie = cookieJar.get(SESSION_COOKIE_NAME)!;
    expect(cookie.options.maxAge).toBe(SESSION_MAX_AGE_REMEMBER_SECONDS);
  });

  it("fails closed with a clear message when auth env is not configured", async () => {
    delete process.env.ADMIN_EMAIL;
    const { loginAction } = await import("@/app/actions/auth");
    const form = new FormData();
    form.set("email", TEST_EMAIL);
    form.set("password", TEST_PASSWORD);
    const result = await loginAction(form);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/chưa được cấu hình/i);
  });

  it("logoutAction removes the session cookie", async () => {
    const { loginAction, logoutAction } = await import("@/app/actions/auth");
    const form = new FormData();
    form.set("email", TEST_EMAIL);
    form.set("password", TEST_PASSWORD);
    await loginAction(form);
    expect(cookieJar.has(SESSION_COOKIE_NAME)).toBe(true);
    await logoutAction();
    expect(cookieJar.has(SESSION_COOKIE_NAME)).toBe(false);
  });
});
