import { GoogleProjectRepository, InMemoryProjectRepository, type ProjectRepository, type ProjectRecord } from "./repository";
import { isGoogleRuntimeConfigured } from "@/lib/server/env";
import { projects } from "@/lib/data/projects";

let cachedInMemory: InMemoryProjectRepository | null = null;
let seedPromise: Promise<void> | null = null;

async function seedFixtureData(repo: InMemoryProjectRepository): Promise<void> {
  const now = new Date().toISOString();
  for (const p of projects) {
    const record: ProjectRecord = { ...p, id: `custom:${p.slug}`, published: true, createdAt: now, updatedAt: now };
    await repo.upsert(record);
  }
}

async function getSeededInMemory(): Promise<InMemoryProjectRepository> {
  if (!cachedInMemory) {
    cachedInMemory = new InMemoryProjectRepository();
    seedPromise = seedFixtureData(cachedInMemory);
  }
  await seedPromise;
  return cachedInMemory;
}

/** Fixture policy (contract): lib/data/projects.ts is design/demo content, never silently presented as real production data — it's the seed for local/dev/test only, used exactly like the equivalent rental-fixture seed in providers.ts. */
export async function getProjectRepository(): Promise<ProjectRepository> {
  if (isGoogleRuntimeConfigured()) return new GoogleProjectRepository();
  return getSeededInMemory();
}
