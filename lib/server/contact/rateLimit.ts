// No "server-only" guard — see lib/server/env.ts for why.
import { createHmac } from "node:crypto";
import type { ContactRepository } from "./repository";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_IN_WINDOW = 3;

export function hashClientIp(ip: string, secret: string): string {
  return createHmac("sha256", secret).update(ip).digest("hex");
}

// globalThis-anchored, not a module-level `let` — see lib/server/media/providers.ts
// for why a plain module singleton can silently split across Next.js's separate
// Route Handler vs. Server Action bundles.
interface RateLimitGlobal {
  recent: Map<string, number[]>;
}
const globalKey = Symbol.for("ndthich.gd6.contactRateLimit");
const globalStore = globalThis as unknown as Record<symbol, RateLimitGlobal>;
if (!globalStore[globalKey]) {
  globalStore[globalKey] = { recent: new Map() };
}
const cache = globalStore[globalKey];

function pruneOld(timestamps: number[], now: number): number[] {
  return timestamps.filter((t) => now - t < WINDOW_MS);
}

/**
 * Two layers, per contract: fast in-process protection (catches rapid bursts
 * within this server's lifetime) plus a check against recently persisted
 * WEB_CONTACTS rows (authoritative across process restarts / multiple
 * instances). Conservative by design — 3 submissions per hashed IP per 10
 * minutes — and never distinguishes "rate limited" from other failures in
 * the response the caller returns to the client.
 */
export async function isRateLimited(ipHash: string, repo: ContactRepository): Promise<boolean> {
  const now = Date.now();
  const inProcess = pruneOld(cache.recent.get(ipHash) ?? [], now);
  if (inProcess.length >= MAX_IN_WINDOW) return true;

  const persisted = await repo.list();
  const persistedRecentCount = persisted.filter(
    (r) => r.ipHash === ipHash && now - Date.parse(r.createdAt) < WINDOW_MS,
  ).length;
  return persistedRecentCount >= MAX_IN_WINDOW;
}

export function recordSubmission(ipHash: string): void {
  const now = Date.now();
  const existing = pruneOld(cache.recent.get(ipHash) ?? [], now);
  existing.push(now);
  cache.recent.set(ipHash, existing);
}
