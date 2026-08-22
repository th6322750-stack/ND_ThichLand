import "server-only";
import { createHmac } from "node:crypto";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const globalKey = Symbol.for("ndthich.admin.loginRateLimit");
const globalStore = globalThis as unknown as Record<symbol, Map<string, { count: number; startedAt: number }>>;

function store(): Map<string, { count: number; startedAt: number }> {
  if (!globalStore[globalKey]) globalStore[globalKey] = new Map();
  return globalStore[globalKey];
}

export function loginRateLimitKey(clientAddress: string, authSecret: string): string {
  return createHmac("sha256", authSecret).update(clientAddress || "unknown").digest("hex");
}

export function isLoginRateLimited(key: string, now = Date.now()): boolean {
  const entry = store().get(key);
  if (!entry) return false;
  if (now - entry.startedAt >= WINDOW_MS) {
    store().delete(key);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

export function recordLoginFailure(key: string, now = Date.now()): void {
  const current = store().get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    store().set(key, { count: 1, startedAt: now });
    return;
  }
  current.count += 1;
}

export function clearLoginFailures(key: string): void {
  store().delete(key);
}
