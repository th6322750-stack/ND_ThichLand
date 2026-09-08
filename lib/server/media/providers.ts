import { GoogleMediaRepository, InMemoryMediaRepository, type MediaRepository, type MediaRecord } from "./repository";
import { GoogleDriveBlobStore, InMemoryBlobStore, LocalDiskBlobStore, type MediaBlobStore } from "./blobStore";
import { getMediaStorageDir, isMediaConfigured } from "@/lib/server/env";
import { resolveProviderMode } from "@/lib/server/providerMode";
import { mediaFixtures } from "@/lib/data/media";

export interface MediaProviders {
  repo: MediaRepository;
  blobStore: MediaBlobStore;
}

async function seedFixtureData(repo: InMemoryMediaRepository): Promise<void> {
  const now = new Date().toISOString();
  for (const m of mediaFixtures) {
    const record: MediaRecord = { ...m, createdAt: now };
    await repo.create(record);
  }
}

// Anchored on globalThis, not a module-level `let` — Next.js bundles
// standalone Route Handlers (app/api/**/route.ts) separately from Server
// Actions/Page RSC modules, so each can end up with its own copy of this
// module and a plain module-level singleton would silently split in two:
// uploads via the Server Action would never be visible to the delivery
// route. globalThis is the one thing guaranteed shared across bundles
// within the same Node process. (Rental/Project/News providers don't need
// this yet — they're only ever read from Page Server Components + Server
// Actions, which Next does bundle together — but any future standalone
// Route Handler reading those would hit the same bug.)
interface MediaProvidersGlobal {
  repo: InMemoryMediaRepository | null;
  blobStore: InMemoryBlobStore | null;
  seedPromise: Promise<void> | null;
}
const globalKey = Symbol.for("ndthich.gd6.mediaProviders");
const globalStore = globalThis as unknown as Record<symbol, MediaProvidersGlobal>;
if (!globalStore[globalKey]) {
  globalStore[globalKey] = { repo: null, blobStore: null, seedPromise: null };
}
const cache = globalStore[globalKey];

async function getSeededProviders(mode: "mock" | "unavailable"): Promise<MediaProviders> {
  if (!cache.repo) {
    cache.repo = new InMemoryMediaRepository();
    cache.blobStore = new InMemoryBlobStore();
    // GĐ6 QA reopen (defect 03): only seed placeholder fixtures in "mock"
    // mode (test/local dev) — "unavailable" (production, not configured)
    // stays empty, never presents the demo Media Library as real content.
    cache.seedPromise = mode === "mock" ? seedFixtureData(cache.repo) : Promise.resolve();
  }
  await cache.seedPromise;
  return { repo: cache.repo, blobStore: cache.blobStore! };
}

export async function getMediaProviders(): Promise<MediaProviders> {
  const mode = resolveProviderMode(isMediaConfigured());
  if (mode === "live") {
    // Bytes on the server's own disk when it has one (VPS), else Drive.
    // Metadata stays in the CMS sheet in both cases.
    const storageDir = getMediaStorageDir();
    const blobStore = storageDir ? new LocalDiskBlobStore(storageDir) : new GoogleDriveBlobStore();
    return { repo: new GoogleMediaRepository(), blobStore };
  }
  return getSeededProviders(mode);
}
