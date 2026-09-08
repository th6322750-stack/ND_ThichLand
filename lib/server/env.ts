// No "server-only" guard here on purpose: this module is also imported by
// standalone scripts (scripts/gd6-bootstrap-cms.ts) run via `tsx` outside
// Next.js's bundler, where the real "server-only" package throws unconditionally
// (it only resolves to a no-op under Next's "react-server" bundler condition).
// The actual credential/internal-data boundary is enforced one layer up, at
// the repository/DAL modules that a page or client component could plausibly
// import — those keep the "server-only" guard. This file only reads env var
// *names*, never embeds a secret value as a literal, so nothing sensitive
// is at stake even if a client bundle pulled it in.
//
// Every accessor here is read lazily (called at request/action time), never
// at module-eval time — required so `next build`/`next start`/tests never
// need live secrets to succeed, and so a missing var fails as a clear
// "server not configured" error exactly where it's used, not silently.

export interface GoogleServiceAccountEnv {
  clientEmail: string;
  privateKey: string;
}

export interface GoogleSpreadsheetEnv {
  rentalSpreadsheetId: string;
  cmsSpreadsheetId: string;
}

export interface AdminAuthEnv {
  email: string;
  passwordHash: string;
  authSecret: string;
}

/** Google service account private keys arrive as env strings with literal `\n` escapes. */
function normalizePrivateKey(raw: string): string {
  return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
}

export function getGoogleServiceAccountEnv(): GoogleServiceAccountEnv | null {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;
  if (!clientEmail || !privateKeyRaw) return null;
  return { clientEmail, privateKey: normalizePrivateKey(privateKeyRaw) };
}

export function requireGoogleServiceAccountEnv(): GoogleServiceAccountEnv {
  const env = getGoogleServiceAccountEnv();
  if (!env) {
    throw new Error(
      "Server configuration error: GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY are not set.",
    );
  }
  return env;
}

export function getGoogleSpreadsheetEnv(): GoogleSpreadsheetEnv | null {
  const rentalSpreadsheetId =
    process.env.GOOGLE_RENTAL_SPREADSHEET_ID ?? "1a9zZjpj2KoM856z5hKtG_euci5cU2cLxirPi5B5qqVU";
  const cmsSpreadsheetId = process.env.GOOGLE_CMS_SPREADSHEET_ID;
  if (!cmsSpreadsheetId) return null;
  return { rentalSpreadsheetId, cmsSpreadsheetId };
}

export function requireGoogleSpreadsheetEnv(): GoogleSpreadsheetEnv {
  const env = getGoogleSpreadsheetEnv();
  if (!env) {
    throw new Error("Server configuration error: GOOGLE_CMS_SPREADSHEET_ID is not set.");
  }
  return env;
}

export function getGoogleMediaFolderId(): string | null {
  return process.env.GOOGLE_MEDIA_FOLDER_ID ?? null;
}

/** Absolute path of a writable directory holding uploaded media bytes, for
 * deployments that own a real disk (the VPS). When set it takes precedence
 * over Drive — a Google service account has no storage quota of its own and
 * cannot upload into a personal Drive folder at all. */
export function getMediaStorageDir(): string | null {
  const dir = process.env.MEDIA_STORAGE_DIR?.trim();
  return dir ? dir : null;
}

export function requireGoogleMediaFolderId(): string {
  const id = getGoogleMediaFolderId();
  if (!id) {
    throw new Error("Server configuration error: GOOGLE_MEDIA_FOLDER_ID is not set.");
  }
  return id;
}

export function getAdminAuthEnv(): AdminAuthEnv | null {
  const email = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const authSecret = process.env.AUTH_SECRET;
  if (!email || !passwordHash || !authSecret) return null;
  // Short signing/encryption keys are accepted only in local/test harnesses.
  // A real production runtime fails closed instead of silently using a weak
  // AUTH_SECRET for both session HMAC and AES-256 key derivation.
  if (process.env.NODE_ENV === "production" && authSecret.length < 32) return null;
  return { email, passwordHash, authSecret };
}

export function requireAdminAuthEnv(): AdminAuthEnv {
  const env = getAdminAuthEnv();
  if (!env) {
    throw new Error(
      "Server configuration error: ADMIN_EMAIL / ADMIN_PASSWORD_HASH / AUTH_SECRET are not set.",
    );
  }
  return env;
}

/** Contract: "Use AUTH_SECRET or dedicated RATE_LIMIT_SECRET to HMAC the client IP" — a
 * dedicated secret is preferred (so rotating it doesn't also invalidate admin sessions),
 * but AUTH_SECRET is an acceptable fallback rather than leaving abuse protection unusable. */
export function getRateLimitSecret(): string | null {
  return process.env.RATE_LIMIT_SECRET ?? process.env.AUTH_SECRET ?? null;
}

/** Signs public legacy-Drive delivery URLs so an arbitrary Drive file ID
 * cannot turn the service account into a public file proxy. */
export function getDriveMediaProxySecret(): string | null {
  return process.env.DRIVE_MEDIA_PROXY_SECRET ?? process.env.AUTH_SECRET ?? null;
}

/**
 * A backend feature is "live-capable" only when every secret it needs is
 * present. Repository factories use this to choose the Google-backed
 * implementation vs. the in-memory mock — mock is always the default.
 */
export function isGoogleRuntimeConfigured(): boolean {
  return getGoogleServiceAccountEnv() !== null && getGoogleSpreadsheetEnv() !== null;
}

export function isAdminAuthConfigured(): boolean {
  return getAdminAuthEnv() !== null;
}

/** Metadata always lives in the CMS sheet, so Google is required either way;
 * the bytes go to local disk when MEDIA_STORAGE_DIR is set, otherwise Drive. */
export function isMediaConfigured(): boolean {
  if (!isGoogleRuntimeConfigured()) return false;
  return getMediaStorageDir() !== null || getGoogleMediaFolderId() !== null;
}

export function isTestEnv(): boolean {
  return process.env.NODE_ENV === "test" || process.env.VITEST === "true";
}
