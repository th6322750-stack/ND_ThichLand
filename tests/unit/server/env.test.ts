import { describe, it, expect, afterEach } from "vitest";
import {
  getGoogleServiceAccountEnv,
  getGoogleSpreadsheetEnv,
  getGoogleMediaFolderId,
  getAdminAuthEnv,
  isGoogleRuntimeConfigured,
  isAdminAuthConfigured,
  isMediaConfigured,
} from "@/lib/server/env";

const ENV_KEYS = [
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
  "GOOGLE_RENTAL_SPREADSHEET_ID",
  "GOOGLE_CMS_SPREADSHEET_ID",
  "GOOGLE_MEDIA_FOLDER_ID",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD_HASH",
  "AUTH_SECRET",
] as const;

function clearEnv() {
  for (const key of ENV_KEYS) delete process.env[key];
}

describe("server env accessors", () => {
  afterEach(clearEnv);

  it("returns null (not throw) for every accessor when unconfigured", () => {
    clearEnv();
    expect(getGoogleServiceAccountEnv()).toBeNull();
    expect(getGoogleSpreadsheetEnv()).toBeNull();
    expect(getGoogleMediaFolderId()).toBeNull();
    expect(getAdminAuthEnv()).toBeNull();
    expect(isGoogleRuntimeConfigured()).toBe(false);
    expect(isAdminAuthConfigured()).toBe(false);
    expect(isMediaConfigured()).toBe(false);
  });

  it("normalizes a literal \\n-escaped private key into real newlines", () => {
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "sa@project.iam.gserviceaccount.com";
    process.env.GOOGLE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\\nMIIBVQ==\\n-----END PRIVATE KEY-----\\n";
    const env = getGoogleServiceAccountEnv();
    expect(env).not.toBeNull();
    expect(env!.privateKey).toContain("\n");
    expect(env!.privateKey).not.toContain("\\n");
  });

  it("defaults GOOGLE_RENTAL_SPREADSHEET_ID to the known production sheet when unset", () => {
    process.env.GOOGLE_CMS_SPREADSHEET_ID = "cms-sheet-id";
    const env = getGoogleSpreadsheetEnv();
    expect(env!.rentalSpreadsheetId).toBe("1a9zZjpj2KoM856z5hKtG_euci5cU2cLxirPi5B5qqVU");
    expect(env!.cmsSpreadsheetId).toBe("cms-sheet-id");
  });

  it("isGoogleRuntimeConfigured requires both service account AND spreadsheet env", () => {
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "sa@project.iam.gserviceaccount.com";
    process.env.GOOGLE_PRIVATE_KEY = "key";
    expect(isGoogleRuntimeConfigured()).toBe(false); // no CMS spreadsheet id yet
    process.env.GOOGLE_CMS_SPREADSHEET_ID = "cms-sheet-id";
    expect(isGoogleRuntimeConfigured()).toBe(true);
  });

  it("isMediaConfigured additionally requires GOOGLE_MEDIA_FOLDER_ID", () => {
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "sa@project.iam.gserviceaccount.com";
    process.env.GOOGLE_PRIVATE_KEY = "key";
    process.env.GOOGLE_CMS_SPREADSHEET_ID = "cms-sheet-id";
    expect(isMediaConfigured()).toBe(false);
    process.env.GOOGLE_MEDIA_FOLDER_ID = "folder-id";
    expect(isMediaConfigured()).toBe(true);
  });

  it("isAdminAuthConfigured requires all three admin auth vars", () => {
    process.env.ADMIN_EMAIL = "admin@ndthich.vn";
    process.env.ADMIN_PASSWORD_HASH = "scrypt:...";
    expect(isAdminAuthConfigured()).toBe(false);
    process.env.AUTH_SECRET = "secret";
    expect(isAdminAuthConfigured()).toBe(true);
  });
});
