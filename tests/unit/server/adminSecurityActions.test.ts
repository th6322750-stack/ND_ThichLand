import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionToken } from "@/lib/server/crypto/session";
import { hashPassword, verifyPassword } from "@/lib/server/crypto/passwords";
import { generateTotpCode } from "@/lib/server/crypto/totp";
import { SESSION_COOKIE_NAME } from "@/lib/authConstants";

const cookieJar = new Map<string, string>();
const cookieStore = {
  get(name: string) {
    return cookieJar.has(name) ? { name, value: cookieJar.get(name)! } : undefined;
  },
  set(name: string, value: string) {
    cookieJar.set(name, value);
  },
  delete(name: string) {
    cookieJar.delete(name);
  },
};

vi.mock("next/headers", () => ({
  cookies: async () => cookieStore,
  headers: async () => new Map<string, string>(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const EMAIL = "admin@ndthich.vn";
const OLD_PASSWORD = "Old-Secure-Password!";
const NEW_PASSWORD = "New-Secure-Password!";
const AUTH_SECRET = "admin-security-test-auth-secret";
let oldPasswordHash: string;

function signIn() {
  const now = Date.now();
  cookieJar.set(
    SESSION_COOKIE_NAME,
    createSessionToken({ sub: EMAIL, role: "admin", iat: now, exp: now + 60_000 }, AUTH_SECRET),
  );
}

describe("admin password and 2FA actions", () => {
  beforeAll(async () => {
    oldPasswordHash = await hashPassword(OLD_PASSWORD);
  });

  beforeEach(() => {
    vi.resetModules();
    cookieJar.clear();
    process.env.ADMIN_EMAIL = EMAIL;
    process.env.ADMIN_PASSWORD_HASH = oldPasswordHash;
    process.env.AUTH_SECRET = AUTH_SECRET;
    signIn();
  });

  afterEach(() => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD_HASH;
    delete process.env.AUTH_SECRET;
  });

  it("requires the current password before changing it and persists only a scrypt hash", async () => {
    const { changeAdminPasswordAction } = await import("@/app/actions/adminSecurity");
    const rejected = await changeAdminPasswordAction({
      currentPassword: "wrong",
      currentTotpCode: "",
      newPassword: NEW_PASSWORD,
      confirmPassword: NEW_PASSWORD,
    });
    expect(rejected.fieldErrors?.currentPassword).toBeTruthy();

    const accepted = await changeAdminPasswordAction({
      currentPassword: OLD_PASSWORD,
      currentTotpCode: "",
      newPassword: NEW_PASSWORD,
      confirmPassword: NEW_PASSWORD,
    });
    expect(accepted.ok).toBe(true);

    const { getEffectiveAdminSecurity } = await import("@/lib/server/auth/security");
    const effective = await getEffectiveAdminSecurity();
    expect(effective?.passwordHash).toMatch(/^scrypt:/);
    expect(effective?.passwordHash).not.toContain(NEW_PASSWORD);
    expect(await verifyPassword(NEW_PASSWORD, effective!.passwordHash)).toBe(true);
  });

  it("enables TOTP, requires it at login, then disables it only with both factors", async () => {
    const {
      beginTwoFactorSetupAction,
      confirmTwoFactorSetupAction,
      disableTwoFactorAction,
    } = await import("@/app/actions/adminSecurity");

    const setup = await beginTwoFactorSetupAction({ currentPassword: OLD_PASSWORD, currentTotpCode: "" });
    expect(setup.ok).toBe(true);
    expect(setup.secret).toBeTruthy();
    expect(setup.setupToken).toBeTruthy();
    const newCode = generateTotpCode(setup.secret!)!;
    const confirmed = await confirmTwoFactorSetupAction({ newTotpCode: newCode, setupToken: setup.setupToken! });
    expect(confirmed.ok).toBe(true);

    cookieJar.clear();
    const { loginAction } = await import("@/app/actions/auth");
    const firstStep = new FormData();
    firstStep.set("email", EMAIL);
    firstStep.set("password", OLD_PASSWORD);
    expect(await loginAction(firstStep)).toMatchObject({ ok: false, requiresTwoFactor: true });
    expect(cookieJar.has(SESSION_COOKIE_NAME)).toBe(false);

    const secondStep = new FormData();
    secondStep.set("email", EMAIL);
    secondStep.set("password", OLD_PASSWORD);
    secondStep.set("totpCode", generateTotpCode(setup.secret!)!);
    expect((await loginAction(secondStep)).ok).toBe(true);

    const wrongDisable = await disableTwoFactorAction({ currentPassword: OLD_PASSWORD, currentTotpCode: "000000" });
    expect(wrongDisable.ok).toBe(false);
    const disabled = await disableTwoFactorAction({
      currentPassword: OLD_PASSWORD,
      currentTotpCode: generateTotpCode(setup.secret!)!,
    });
    expect(disabled.ok).toBe(true);
  });
});
