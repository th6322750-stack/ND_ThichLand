import "server-only";

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

export function getZaloUrl(): string | null {
  return process.env.NEXT_PUBLIC_ZALO_URL ?? null;
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

export function isMediaConfigured(): boolean {
  return isGoogleRuntimeConfigured() && getGoogleMediaFolderId() !== null;
}

export function isTestEnv(): boolean {
  return process.env.NODE_ENV === "test" || process.env.VITEST === "true";
}
