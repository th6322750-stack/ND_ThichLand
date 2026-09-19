import "server-only";
import { getAdminAuthEnv } from "@/lib/server/env";
import { decryptServerSecret } from "@/lib/server/crypto/encryptedSecret";
import { getAdminSecurityRepository } from "./securityProviders";
import type { AdminSecurityRecord } from "./securityRepository";

export interface EffectiveAdminSecurity {
  email: string;
  passwordHash: string;
  authSecret: string;
  totpEnabled: boolean;
  totpSecret: string | null;
  storedRecord: AdminSecurityRecord | null;
}

/**
 * Environment credentials are the immutable bootstrap/fallback. Once the
 * CMS security row exists its password and encrypted TOTP state take over.
 * A corrupt enabled TOTP record fails closed instead of bypassing 2FA.
 */
export async function getEffectiveAdminSecurity(): Promise<EffectiveAdminSecurity | null> {
  const authEnv = getAdminAuthEnv();
  if (!authEnv) return null;

  const repo = await getAdminSecurityRepository();
  const storedRecord = await repo.get();
  if (!storedRecord) {
    return {
      ...authEnv,
      totpEnabled: false,
      totpSecret: null,
      storedRecord: null,
    };
  }

  const totpSecret = storedRecord.totpSecretCiphertext
    ? decryptServerSecret(storedRecord.totpSecretCiphertext, authEnv.authSecret)
    : null;
  if (storedRecord.totpEnabled && !totpSecret) {
    throw new Error("Admin TOTP configuration is invalid or cannot be decrypted.");
  }

  return {
    email: authEnv.email,
    authSecret: authEnv.authSecret,
    passwordHash: storedRecord.passwordHash,
    totpEnabled: storedRecord.totpEnabled,
    totpSecret,
    storedRecord,
  };
}
