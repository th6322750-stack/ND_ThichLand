import { isGoogleRuntimeConfigured } from "@/lib/server/env";
import { resolveProviderMode } from "@/lib/server/providerMode";
import {
  GooglePageContentRepository,
  InMemoryPageContentRepository,
  type PageContentRepository,
} from "./repository";

let cachedInMemory: InMemoryPageContentRepository | null = null;

export async function getPageContentRepository(): Promise<PageContentRepository> {
  if (resolveProviderMode(isGoogleRuntimeConfigured()) === "live") {
    return new GooglePageContentRepository();
  }
  if (!cachedInMemory) cachedInMemory = new InMemoryPageContentRepository();
  return cachedInMemory;
}
