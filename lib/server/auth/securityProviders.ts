import "server-only";
import {
  GoogleAdminSecurityRepository,
  InMemoryAdminSecurityRepository,
  type AdminSecurityRepository,
} from "./securityRepository";
import { isGoogleRuntimeConfigured } from "@/lib/server/env";
import { resolveProviderMode } from "@/lib/server/providerMode";

let cachedInMemory: InMemoryAdminSecurityRepository | null = null;

export function getAdminSecurityPersistenceMode(): "live" | "mock" | "unavailable" {
  return resolveProviderMode(isGoogleRuntimeConfigured());
}

export async function getAdminSecurityRepository(): Promise<AdminSecurityRepository> {
  const mode = getAdminSecurityPersistenceMode();
  if (mode === "live") return new GoogleAdminSecurityRepository();
  if (!cachedInMemory) cachedInMemory = new InMemoryAdminSecurityRepository();
  return cachedInMemory;
}
