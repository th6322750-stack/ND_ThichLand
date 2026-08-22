"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/server/auth/dal";
import { getEffectiveAdminSecurity } from "@/lib/server/auth/security";
import {
  getAdminSecurityPersistenceMode,
  getAdminSecurityRepository,
} from "@/lib/server/auth/securityProviders";
import { encryptServerSecret } from "@/lib/server/crypto/encryptedSecret";
import { hashPassword, verifyPassword } from "@/lib/server/crypto/passwords";
import {
  buildTotpUri,
  generateTotpSecret,
  isValidTotpSecret,
  verifyTotpCode,
} from "@/lib/server/crypto/totp";
import { createTotpSetupToken, verifyTotpSetupToken } from "@/lib/server/crypto/totpSetupToken";
import { PERSISTENCE_NOT_CONFIGURED_ERROR } from "@/lib/server/providerMode";
import type { AdminSecurityRecord } from "@/lib/server/auth/securityRepository";

export interface AdminSecurityActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export interface TwoFactorSetupResult extends AdminSecurityActionResult {
  secret?: string;
  uri?: string;
  setupToken?: string;
}

const UNAUTHORIZED = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
const INVALID_CURRENT_PASSWORD = "Mật khẩu hiện tại không đúng.";
const INVALID_CURRENT_CODE = "Mã 2FA hiện tại không đúng hoặc đã hết hạn.";
const INVALID_NEW_CODE = "Mã 2FA mới không đúng hoặc đã hết hạn.";

async function loadAuthorizedSecurity() {
  const session = await requireSession();
  const security = await getEffectiveAdminSecurity();
  if (!security || session.sub.toLowerCase() !== security.email.toLowerCase()) {
    throw new Error(UNAUTHORIZED);
  }
  return security;
}

function persistenceError(): AdminSecurityActionResult | null {
  return getAdminSecurityPersistenceMode() === "unavailable"
    ? { ok: false, error: PERSISTENCE_NOT_CONFIGURED_ERROR }
    : null;
}

async function verifyCurrentFactors(
  password: string,
  currentTotpCode: string,
): Promise<{ ok: true; security: NonNullable<Awaited<ReturnType<typeof getEffectiveAdminSecurity>>> } | { ok: false; result: AdminSecurityActionResult }> {
  let security;
  try {
    security = await loadAuthorizedSecurity();
  } catch {
    return { ok: false, result: { ok: false, error: UNAUTHORIZED } };
  }
  if (!(await verifyPassword(password, security.passwordHash))) {
    return { ok: false, result: { ok: false, fieldErrors: { currentPassword: INVALID_CURRENT_PASSWORD } } };
  }
  if (security.totpEnabled && (!security.totpSecret || !verifyTotpCode(currentTotpCode, security.totpSecret))) {
    return { ok: false, result: { ok: false, fieldErrors: { currentTotpCode: INVALID_CURRENT_CODE } } };
  }
  return { ok: true, security };
}

async function saveRecord(record: AdminSecurityRecord): Promise<void> {
  const repo = await getAdminSecurityRepository();
  await repo.save(record);
  revalidatePath("/admin/cai-dat");
}

export async function changeAdminPasswordAction(input: {
  currentPassword: string;
  currentTotpCode: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<AdminSecurityActionResult> {
  const factors = await verifyCurrentFactors(input.currentPassword, input.currentTotpCode);
  if (!factors.ok) return factors.result;
  const noPersistence = persistenceError();
  if (noPersistence) return noPersistence;

  const fieldErrors: Record<string, string> = {};
  if (input.newPassword.length < 12) fieldErrors.newPassword = "Mật khẩu mới cần ít nhất 12 ký tự.";
  if (input.newPassword.length > 128) fieldErrors.newPassword = "Mật khẩu mới không được quá 128 ký tự.";
  if (input.newPassword !== input.confirmPassword) fieldErrors.confirmPassword = "Mật khẩu nhập lại chưa khớp.";
  if (await verifyPassword(input.newPassword, factors.security.passwordHash)) {
    fieldErrors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại.";
  }
  if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors };

  await saveRecord({
    passwordHash: await hashPassword(input.newPassword),
    totpSecretCiphertext: factors.security.storedRecord?.totpSecretCiphertext ?? "",
    totpEnabled: factors.security.totpEnabled,
    updatedAt: new Date().toISOString(),
  });
  return { ok: true };
}

export async function beginTwoFactorSetupAction(input: {
  currentPassword: string;
  currentTotpCode: string;
}): Promise<TwoFactorSetupResult> {
  const factors = await verifyCurrentFactors(input.currentPassword, input.currentTotpCode);
  if (!factors.ok) return factors.result;
  const noPersistence = persistenceError();
  if (noPersistence) return noPersistence;

  const secret = generateTotpSecret();
  return {
    ok: true,
    secret,
    uri: buildTotpUri(secret, factors.security.email),
    setupToken: createTotpSetupToken(
      {
        sub: factors.security.email,
        secret,
        exp: Date.now() + 10 * 60 * 1000,
        stateVersion: factors.security.storedRecord?.updatedAt ?? "bootstrap",
      },
      factors.security.authSecret,
    ),
  };
}

export async function confirmTwoFactorSetupAction(input: {
  newTotpCode: string;
  setupToken: string;
}): Promise<AdminSecurityActionResult> {
  let security;
  try {
    security = await loadAuthorizedSecurity();
  } catch {
    return { ok: false, error: UNAUTHORIZED };
  }
  const noPersistence = persistenceError();
  if (noPersistence) return noPersistence;
  const setup = verifyTotpSetupToken(input.setupToken, security.authSecret);
  if (
    !setup ||
    setup.sub.toLowerCase() !== security.email.toLowerCase() ||
    setup.stateVersion !== (security.storedRecord?.updatedAt ?? "bootstrap") ||
    !isValidTotpSecret(setup.secret)
  ) {
    return { ok: false, error: "Phiên thiết lập 2FA đã hết hạn. Vui lòng tạo lại khóa." };
  }
  if (!verifyTotpCode(input.newTotpCode, setup.secret)) {
    return { ok: false, fieldErrors: { newTotpCode: INVALID_NEW_CODE } };
  }

  await saveRecord({
    passwordHash: security.passwordHash,
    totpSecretCiphertext: encryptServerSecret(setup.secret, security.authSecret),
    totpEnabled: true,
    updatedAt: new Date().toISOString(),
  });
  return { ok: true };
}

export async function disableTwoFactorAction(input: {
  currentPassword: string;
  currentTotpCode: string;
}): Promise<AdminSecurityActionResult> {
  const factors = await verifyCurrentFactors(input.currentPassword, input.currentTotpCode);
  if (!factors.ok) return factors.result;
  const noPersistence = persistenceError();
  if (noPersistence) return noPersistence;

  await saveRecord({
    passwordHash: factors.security.passwordHash,
    totpSecretCiphertext: "",
    totpEnabled: false,
    updatedAt: new Date().toISOString(),
  });
  return { ok: true };
}
