// No "server-only" guard — see lib/server/env.ts for why.
import { isTestEnv } from "./env";

/**
 * Single decision point every domain's provider factory (rental/projects/
 * news/media/contact) must go through — so none of them can drift into
 * silently serving demo content, or silently "succeeding" a write, in a
 * real production runtime that's missing its required config.
 *
 * - "live": real Google-backed provider.
 * - "mock": in-memory/fixture provider is fine — automated tests or local
 *   development only.
 * - "unavailable": production, not configured. Reads must come back empty
 *   (never GĐ4/GĐ5 fixture content presented as real), and writes must be
 *   refused with PERSISTENCE_NOT_CONFIGURED_ERROR rather than appearing to
 *   succeed against a throwaway in-memory store that's gone on the next
 *   request.
 *
 * Note: `next start` sets NODE_ENV=production even when run locally for
 * manual/e2e QA — by design, that correctly resolves to "unavailable"
 * without Google config, the same as a real deployment would. Local QA
 * that wants fixture/mock behavior should use `next dev` (NODE_ENV=
 * development) instead, same as this repo already does for
 * AUTH_COOKIE_INSECURE-style local-only concerns.
 */
export type ProviderMode = "live" | "mock" | "unavailable";

export function resolveProviderMode(isConfigured: boolean): ProviderMode {
  if (isConfigured) return "live";
  if (isTestEnv()) return "mock";
  if (process.env.NODE_ENV !== "production") return "mock";
  return "unavailable";
}

export const PERSISTENCE_NOT_CONFIGURED_ERROR =
  "Máy chủ chưa được cấu hình lưu trữ dữ liệu. Vui lòng liên hệ quản trị viên.";
