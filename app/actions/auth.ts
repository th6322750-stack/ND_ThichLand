"use server";

import { cookies, headers } from "next/headers";
import { getAdminAuthEnv } from "@/lib/server/env";
import { verifyPassword } from "@/lib/server/crypto/passwords";
import { createSessionToken } from "@/lib/server/crypto/session";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_DEFAULT_SECONDS,
  SESSION_MAX_AGE_REMEMBER_SECONDS,
} from "@/lib/authConstants";

export interface LoginResult {
  ok: boolean;
  error?: string;
}

const GENERIC_INVALID_CREDENTIALS = "Email hoặc mật khẩu không đúng.";
const NOT_CONFIGURED_MESSAGE = "Máy chủ chưa được cấu hình đăng nhập. Vui lòng liên hệ quản trị viên.";

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
  const rememberMe = formData.get("remember") === "on" || formData.get("remember") === "true";

  const authEnv = getAdminAuthEnv();
  if (!authEnv) {
    return { ok: false, error: NOT_CONFIGURED_MESSAGE };
  }

  // Always run verifyPassword even on an email mismatch — its cost is
  // constant regardless of input, so this avoids a trivial timing signal
  // that would otherwise leak whether the email matched.
  const emailMatches = email.length > 0 && email.toLowerCase() === authEnv.email.toLowerCase();
  const passwordMatches = await verifyPassword(password, authEnv.passwordHash);

  if (!emailMatches || !passwordMatches) {
    return { ok: false, error: GENERIC_INVALID_CREDENTIALS };
  }

  const now = Date.now();
  const maxAgeSeconds = rememberMe ? SESSION_MAX_AGE_REMEMBER_SECONDS : SESSION_MAX_AGE_DEFAULT_SECONDS;
  const token = createSessionToken(
    { sub: authEnv.email, role: "admin", iat: now, exp: now + maxAgeSeconds * 1000 },
    authEnv.authSecret,
  );

  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: await shouldUseSecureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });

  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}
