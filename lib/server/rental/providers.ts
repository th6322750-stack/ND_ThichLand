import { GoogleRentalSource, InMemoryRentalSource, type RentalSourceProvider } from "./source";
import {
  GoogleRentalOverlayRepository,
  InMemoryRentalOverlayRepository,
  type RentalOverlayRepository,
  type CustomBdsRecord,
} from "./overlay";
import { isGoogleRuntimeConfigured } from "@/lib/server/env";
import { resolveProviderMode } from "@/lib/server/providerMode";
import { adminProperties } from "@/lib/data/properties.admin";

// Process-lifetime singleton so Admin edits made against the in-memory
// provider (no live Google secrets configured) actually persist across
// requests within a dev/test session instead of resetting every time —
// same reason a real database connection is cached, not reopened per call.
let cachedInMemoryOverlay: InMemoryRentalOverlayRepository | null = null;
let seedPromise: Promise<void> | null = null;

async function seedFixtureData(overlay: InMemoryRentalOverlayRepository): Promise<void> {
  const now = new Date().toISOString();
  for (const p of adminProperties) {
    const record: CustomBdsRecord = {
      // Must match the same `custom:${slug}` id saveBdsAction computes when
      // editing — otherwise an edit creates an orphaned duplicate record
      // instead of updating this one (found the hard way via e2e testing).
      id: `custom:${p.slug}`,
      slug: p.slug,
      roomNo: p.roomNo,
      location: p.location,
      address: p.address,
      price: p.price,
      serviceFee: p.serviceFee,
      area: p.area,
      verticalAccess: p.verticalAccess,
      // Fixture data (lib/data/properties.ts) always has real values here —
      // the fallback only exists to satisfy CustomBdsRecord's raw-string
      // shape now that AdminPropertyRecord allows propertyType/availability
      // to be null (GĐ6 QA reopen, defect 01).
      propertyType: p.propertyType ?? "",
      description: p.description,
      highlights: p.highlights,
      availability: p.availability ?? "",
      bedroomCount: p.bedroomCount,
      furnishingStatus: p.furnishingStatus,
      bathroomCount: p.bathroomCount,
      amenities: p.amenities,
      locationNote: p.locationNote,
      videoUrl: p.videoUrl,
      media: p.media,
      commission: p.commission,
      guidePerson: p.guidePerson,
      internalNotes: p.internalNotes,
      published: true,
      createdAt: now,
      updatedAt: now,
    };
    await overlay.upsertCustomRecord(record);
  }
}

async function getSeededInMemoryOverlay(mode: "mock" | "unavailable"): Promise<InMemoryRentalOverlayRepository> {
  if (!cachedInMemoryOverlay) {
    cachedInMemoryOverlay = new InMemoryRentalOverlayRepository();
    // GĐ6 QA reopen (defect 03): only seed GĐ4/GĐ5 fixture rows in "mock"
    // mode (test/local dev). In "unavailable" (production, not configured)
    // the overlay stays empty — never presents fixture rows as real listings.
    seedPromise = mode === "mock" ? seedFixtureData(cachedInMemoryOverlay) : Promise.resolve();
  }
  await seedPromise;
  return cachedInMemoryOverlay;
}

export interface RentalProviders {
  source: RentalSourceProvider;
  overlay: RentalOverlayRepository;
}

/**
 * Live Google-backed providers only when the full runtime env is present;
 * otherwise the same GĐ4/5 demo fixture, seeded into the in-memory overlay
 * so the whole merge/DTO pipeline (including Admin edit/hide/create) is
 * exercised for real even with zero secrets configured — the public site's
 * default appearance stays identical to before GĐ6. In a real production
 * runtime without config ("unavailable"), the overlay is left unseeded
 * instead (defect 03) — reads come back empty rather than presenting demo
 * content as real, and the raw source is still empty either way (it was
 * never fixture-backed to begin with).
 */
export async function getRentalProviders(): Promise<RentalProviders> {
  const mode = resolveProviderMode(isGoogleRuntimeConfigured());
  if (mode === "live") {
    return { source: new GoogleRentalSource(), overlay: new GoogleRentalOverlayRepository() };
  }
  return { source: new InMemoryRentalSource([]), overlay: await getSeededInMemoryOverlay(mode) };
}
