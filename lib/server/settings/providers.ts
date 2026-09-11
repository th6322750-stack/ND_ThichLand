import {
  GoogleSiteSettingsRepository,
  InMemorySiteSettingsRepository,
  type SiteSettingsRepository,
} from "./repository";
import { isGoogleRuntimeConfigured } from "@/lib/server/env";
import { resolveProviderMode } from "@/lib/server/providerMode";

let cachedInMemory: InMemorySiteSettingsRepository | null = null;

/**
 * Unlike the rental/project/news providers, this one serves its defaults in
 * "unavailable" mode too. Those repositories stay empty there because their
 * fixtures are invented demo content that must never be presented as real
 * listings. DEFAULT_SITE_SETTINGS is the opposite: it is the company's own
 * real address and hotline, copied from the components that hardcode them
 * today. Falling back to a blank contact panel would remove true information,
 * not withhold fabricated information.
 */
export async function getSiteSettingsRepository(): Promise<SiteSettingsRepository> {
  const mode = resolveProviderMode(isGoogleRuntimeConfigured());
  if (mode === "live") return new GoogleSiteSettingsRepository();
  if (!cachedInMemory) cachedInMemory = new InMemorySiteSettingsRepository();
  return cachedInMemory;
}
