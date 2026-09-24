"use server";

import { cookies, headers } from "next/headers";
import { verifyPassword } from "@/lib/server/crypto/passwords";
import { verifyTotpCode } from "@/lib/server/crypto/totp";
import { createSessionToken } from "@/lib/server/crypto/session";
import { getEffectiveAdminSecurity } from "@/lib/server/auth/security";
import {
  clearLoginFailures,
  isLoginRateLimited,
  loginRateLimitKey,
  recordLoginFailure,
} from "@/lib/server/auth/loginRateLimit";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_DEFAULT_SECONDS,
  SESSION_MAX_AGE_REMEMBER_SECONDS,
} from "@/lib/authConstants";

export interface LoginResult {
  ok: boolean;
  error?: string;
  requiresTwoFactor?: boolean;
}

const GENERIC_INVALID_CREDENTIALS = "Email hoặc mật khẩu không đúng.";
const NOT_CONFIGURED_MESSAGE = "Máy chủ chưa được cấu hình đăng nhập. Vui lòng liên hệ quản trị viên.";
const AUTH_UNAVAILABLE_MESSAGE = "Dịch vụ đăng nhập tạm thời không khả dụng. Vui lòng thử lại sau.";
const INVALID_TWO_FACTOR_MESSAGE = "Mã xác thực 2 bước không đúng hoặc đã hết hạn.";
const RATE_LIMITED_MESSAGE = "Quá nhiều lần đăng nhập không thành công. Vui lòng thử lại sau 15 phút.";

async function clientAddress(): Promise<string> {
  const requestHeaders = await headers();
  return requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";
}

/**
 * `NODE_ENV === "production"` alone isn't reliable for the cookie's Secure
 * flag: `next start` (a production build) sets NODE_ENV=production even
 * when run locally over plain HTTP for testing, where a Secure cookie
 * would silently never be sent back by the browser. Prefer the actual
 * request protocol (x-forwarded-proto, set by any real HTTPS-terminating
 * proxy/CDN) when it's present; AUTH_COOKIE_INSECURE is an explicit,
 * intentionally-named escape hatch for local/CI HTTP testing only — no
 * real deployment would set it.
 */
async function shouldUseSecureCookie(): Promise<boolean> {
  if (process.env.AUTH_COOKIE_INSECURE === "true") return false;
  const requestHeaders = await headers();
  const forwardedProto = requestHeaders.get("x-forwarded-proto");
  if (forwardedProto) return forwardedProto === "https";
  return process.env.NODE_ENV === "production";
}

export async function loginAction(formData: FormData): Promise<LoginResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const totpCode = String(formData.get("totpCode") ?? "");
  const rememberMe = formData.get("remember") === "on" || formData.get("remember") === "true";

  let security;
  try {
    security = await getEffectiveAdminSecurity();
  } catch {
    return { ok: false, error: AUTH_UNAVAILABLE_MESSAGE };
  }
  if (!security) {
    return { ok: false, error: NOT_CONFIGURED_MESSAGE };
  }

  const rateKey = loginRateLimitKey(await clientAddress(), security.authSecret);
  if (isLoginRateLimited(rateKey)) return { ok: false, error: RATE_LIMITED_MESSAGE };

  // Always run verifyPassword even on an email mismatch — its cost is
  // constant regardless of input, so this avoids a trivial timing signal
  // that would otherwise leak whether the email matched.
  const emailMatches = email.length > 0 && email.toLowerCase() === security.email.toLowerCase();
  const passwordMatches = await verifyPassword(password, security.passwordHash);

  if (!emailMatches || !passwordMatches) {
    recordLoginFailure(rateKey);
    return { ok: false, error: GENERIC_INVALID_CREDENTIALS };
  }

  if (security.totpEnabled) {
    if (!totpCode.trim()) {
      return { ok: false, requiresTwoFactor: true };
    }
    if (!security.totpSecret || !verifyTotpCode(totpCode, security.totpSecret)) {
      recordLoginFailure(rateKey);
      return { ok: false, error: INVALID_TWO_FACTOR_MESSAGE, requiresTwoFactor: true };
    }
  }

  const now = Date.now();
  const maxAgeSeconds = rememberMe ? SESSION_MAX_AGE_REMEMBER_SECONDS : SESSION_MAX_AGE_DEFAULT_SECONDS;
  const token = createSessionToken(
    { sub: security.email, role: "admin", iat: now, exp: now + maxAgeSeconds * 1000 },
    security.authSecret,
  );

  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: await shouldUseSecureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });

  clearLoginFailures(rateKey);

  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}
