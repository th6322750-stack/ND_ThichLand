import { GoogleNewsRepository, InMemoryNewsRepository, type NewsRepository, type NewsRecord } from "./repository";
import { isGoogleRuntimeConfigured } from "@/lib/server/env";
import { resolveProviderMode } from "@/lib/server/providerMode";
import { news } from "@/lib/data/news";

let cachedInMemory: InMemoryNewsRepository | null = null;
let seedPromise: Promise<void> | null = null;

async function seedFixtureData(repo: InMemoryNewsRepository): Promise<void> {
  const now = new Date().toISOString();
  for (const a of news) {
    const record: NewsRecord = { ...a, id: `custom:${a.slug}`, published: true, createdAt: now, updatedAt: now };
    await repo.upsert(record);
  }
}

async function getSeededInMemory(mode: "mock" | "unavailable"): Promise<InMemoryNewsRepository> {
  if (!cachedInMemory) {
    cachedInMemory = new InMemoryNewsRepository();
    // GĐ6 QA reopen (defect 03): only seed demo content in "mock" mode
    // (test/local dev) — "unavailable" (production, not configured) stays
    // empty, never presents fixture articles as real published content.
    seedPromise = mode === "mock" ? seedFixtureData(cachedInMemory) : Promise.resolve();
  }
  await seedPromise;
  return cachedInMemory;
}

/** Fixture policy (contract): lib/data/news.ts is design/demo content, seeded for local/dev/test only — same treatment as the rental and project fixture seeds. */
export async function getNewsRepository(): Promise<NewsRepository> {
  const mode = resolveProviderMode(isGoogleRuntimeConfigured());
  if (mode === "live") return new GoogleNewsRepository();
  return getSeededInMemory(mode);
}
