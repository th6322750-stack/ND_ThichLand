import { GoogleProjectRepository, InMemoryProjectRepository, type ProjectRepository, type ProjectRecord } from "./repository";
import { isGoogleRuntimeConfigured } from "@/lib/server/env";
import { resolveProviderMode } from "@/lib/server/providerMode";
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

async function getSeededInMemory(mode: "mock" | "unavailable"): Promise<InMemoryProjectRepository> {
  if (!cachedInMemory) {
    cachedInMemory = new InMemoryProjectRepository();
    // GĐ6 QA reopen (defect 03): only seed demo fixture content in "mock"
    // mode (test/local dev). In "unavailable" (production, not configured)
    // the repository stays empty — never presents GĐ4/GĐ5 fixture projects
    // as real published content.
    seedPromise = mode === "mock" ? seedFixtureData(cachedInMemory) : Promise.resolve();
  }
  await seedPromise;
  return cachedInMemory;
}

/** Fixture policy (contract): lib/data/projects.ts is design/demo content, never silently presented as real production data — it's the seed for local/dev/test only, used exactly like the equivalent rental-fixture seed in providers.ts. */
export async function getProjectRepository(): Promise<ProjectRepository> {
  const mode = resolveProviderMode(isGoogleRuntimeConfigured());
  if (mode === "live") return new GoogleProjectRepository();
  return getSeededInMemory(mode);
}
