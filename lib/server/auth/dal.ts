import "server-only";
import { cookies } from "next/headers";
import { getAdminAuthEnv } from "@/lib/server/env";
import { verifySessionToken, type SessionPayload } from "@/lib/server/crypto/session";
import { SESSION_COOKIE_NAME } from "@/lib/authConstants";

/**
 * The single source of truth for "is this request authenticated". Called
 * again inside every protected page/server-action/route-handler — proxy.ts
 * only does an optimistic redirect and must never be trusted as the real
 * authorization check (contract: "do not trust proxy/client state").
 */
export async function getSession(): Promise<SessionPayload | null> {
  const authEnv = getAdminAuthEnv();
  if (!authEnv) return null;

  const store = await cookies();
  const raw = store.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;

  return verifySessionToken(raw, authEnv.authSecret);
}

export class AuthError extends Error {
  constructor(public code: "UNAUTHENTICATED" | "NOT_CONFIGURED" = "UNAUTHENTICATED") {
    super(code);
  }
}

/** For server actions/route handlers: throws instead of redirecting, so the caller returns a proper error response. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new AuthError("UNAUTHENTICATED");
  return session;
}
