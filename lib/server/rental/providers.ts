import { GoogleRentalSource, InMemoryRentalSource, type RentalSourceProvider } from "./source";
import {
  GoogleRentalOverlayRepository,
  InMemoryRentalOverlayRepository,
  type RentalOverlayRepository,
  type CustomBdsRecord,
} from "./overlay";
import { isGoogleRuntimeConfigured } from "@/lib/server/env";
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
      propertyType: p.propertyType,
      description: p.description,
      highlights: p.highlights,
      availability: p.availability,
      bedroomCount: p.bedroomCount,
      furnishingStatus: p.furnishingStatus,
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

async function getSeededInMemoryOverlay(): Promise<InMemoryRentalOverlayRepository> {
  if (!cachedInMemoryOverlay) {
    cachedInMemoryOverlay = new InMemoryRentalOverlayRepository();
    seedPromise = seedFixtureData(cachedInMemoryOverlay);
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
 * default appearance stays identical to before GĐ6.
 */
export async function getRentalProviders(): Promise<RentalProviders> {
  if (isGoogleRuntimeConfigured()) {
    return { source: new GoogleRentalSource(), overlay: new GoogleRentalOverlayRepository() };
  }
  return { source: new InMemoryRentalSource([]), overlay: await getSeededInMemoryOverlay() };
}
