// No "server-only" guard — see lib/server/env.ts for why (also used by
// scripts/gd6-bootstrap-cms.ts via tsx, outside Next's bundler condition).
import { google } from "googleapis";
import { requireGoogleServiceAccountEnv } from "@/lib/server/env";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"];

let cachedAuth: InstanceType<typeof google.auth.JWT> | null = null;

/** Lazily constructed and cached — never touches env/network at module load. */
export function getGoogleAuthClient(): InstanceType<typeof google.auth.JWT> {
  if (cachedAuth) return cachedAuth;
  const { clientEmail, privateKey } = requireGoogleServiceAccountEnv();
  cachedAuth = new google.auth.JWT({ email: clientEmail, key: privateKey, scopes: SCOPES });
  return cachedAuth;
}
