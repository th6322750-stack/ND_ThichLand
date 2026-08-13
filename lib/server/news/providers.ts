import { GoogleNewsRepository, InMemoryNewsRepository, type NewsRepository, type NewsRecord } from "./repository";
import { isGoogleRuntimeConfigured } from "@/lib/server/env";
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

async function getSeededInMemory(): Promise<InMemoryNewsRepository> {
  if (!cachedInMemory) {
    cachedInMemory = new InMemoryNewsRepository();
    seedPromise = seedFixtureData(cachedInMemory);
  }
  await seedPromise;
  return cachedInMemory;
}

/** Fixture policy (contract): lib/data/news.ts is design/demo content, seeded for local/dev/test only — same treatment as the rental and project fixture seeds. */
export async function getNewsRepository(): Promise<NewsRepository> {
  if (isGoogleRuntimeConfigured()) return new GoogleNewsRepository();
  return getSeededInMemory();
}
