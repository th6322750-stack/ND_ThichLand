import { GoogleContactRepository, InMemoryContactRepository, type ContactRepository } from "./repository";
import { isGoogleRuntimeConfigured } from "@/lib/server/env";

// globalThis-anchored — see lib/server/media/providers.ts for why a plain
// module-level singleton can silently split across Next.js's separate
// Route Handler vs. Server Action bundles.
const globalKey = Symbol.for("ndthich.gd6.contactRepository");
const globalStore = globalThis as unknown as Record<symbol, InMemoryContactRepository | undefined>;

export async function getContactRepository(): Promise<ContactRepository> {
  if (isGoogleRuntimeConfigured()) return new GoogleContactRepository();
  if (!globalStore[globalKey]) {
    globalStore[globalKey] = new InMemoryContactRepository();
  }
  return globalStore[globalKey];
}
