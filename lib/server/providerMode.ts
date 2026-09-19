// No "server-only" guard — see lib/server/env.ts for why.
import { isGoogleRuntimeConfigured, isTestEnv } from "./env";

/**
 * Single decision point every domain's provider factory (rental/projects/
 * news/media/contact) must go through — so none of them can drift into
 * silently serving demo content, or silently "succeeding" a write, in a
 * real production runtime that's missing its required config.
 *
 * - "live": real Google-backed provider.
 * - "mock": in-memory/fixture provider is fine — automated tests, local
 *   development, or an explicit client-demo deployment (see DEMO_MODE
 *   below) only.
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
 *
 * DEMO_MODE is a separate, explicit opt-in — set only on a dedicated
 * client-preview deployment's own env, never on the real production
 * service — for showing a populated site (fixture BĐS/project/news data)
 * to a client before real Google secrets exist. It does not change the
 * default: an unconfigured deployment with DEMO_MODE unset (i.e. the real
 * production target) still resolves to "unavailable" exactly as before.
 */
export type ProviderMode = "live" | "mock" | "unavailable";

export function resolveProviderMode(isConfigured: boolean): ProviderMode {
  if (isConfigured) return "live";
  if (isTestEnv()) return "mock";
  if (process.env.DEMO_MODE === "true") return "mock";
  if (process.env.NODE_ENV !== "production") return "mock";
  return "unavailable";
}

export const PERSISTENCE_NOT_CONFIGURED_ERROR =
  "Máy chủ chưa được cấu hình lưu trữ dữ liệu. Vui lòng liên hệ quản trị viên.";

// Whether the currently running deployment is serving data through the
// ephemeral in-memory/fixture providers rather than real Google-backed
// storage — used only to decide whether to show the Dashboard's demo-mode
// notice, never to change what any provider actually does.
export function isDemoModeActive(): boolean {
  return resolveProviderMode(isGoogleRuntimeConfigured()) === "mock";
}
