import { parseRentalRows } from "./parse";
import type { RentalSourceProvider } from "./source";
import type { RentalOverlayRepository, CustomBdsRecord, OverrideRecord } from "./overlay";
import type { AdminPropertyRecord, Availability, PropertyType } from "@/lib/types";
import { resolveLegacyMediaLink } from "@/lib/server/media/legacyResolve";

export interface MergedRentalData {
  admin: AdminPropertyRecord[];
  diagnostics: {
    ignored: number;
    quarantined: number;
    quarantinedRows: { sourceRow: number; reason: string }[];
    mediaDiagnostics: { sourceRow: number; diagnostic: string }[];
  };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Stable even if roomNo/address copy later changes via an override patch —
 * the numeric sourceRow suffix is fixed at parse time and never recomputed.
 */
function slugForSourceRow(roomNo: string, sourceRow: number): string {
  const prefix = slugify(roomNo) || "phong";
  return `${prefix}-${sourceRow}`;
}

const KNOWN_PROPERTY_TYPES: PropertyType[] = ["Căn hộ", "Nhà", "Mặt bằng", "Văn phòng", "Xưởng", "Studio"];
const KNOWN_AVAILABILITY: Availability[] = ["Còn trống", "Đã cho thuê", "Sắp trống"];

function coercePropertyType(value: string): PropertyType {
  return (KNOWN_PROPERTY_TYPES as string[]).includes(value) ? (value as PropertyType) : "Nhà";
}

function coerceAvailability(value: string): Availability {
  return (KNOWN_AVAILABILITY as string[]).includes(value) ? (value as Availability) : "Còn trống";
}

function customToAdminRecord(c: CustomBdsRecord): AdminPropertyRecord {
  return {
    slug: c.slug,
    roomNo: c.roomNo,
    location: c.location,
    address: c.address,
    price: c.price ?? 0,
    serviceFee: c.serviceFee,
    area: c.area ?? 0,
    verticalAccess: c.verticalAccess,
    propertyType: coercePropertyType(c.propertyType),
    description: c.description,
    highlights: c.highlights,
    availability: coerceAvailability(c.availability),
    media: c.media,
    bedroomCount: c.bedroomCount,
    furnishingStatus: c.furnishingStatus,
    commission: c.commission,
    guidePerson: c.guidePerson,
    internalNotes: c.internalNotes,
    published: c.published,
  };
}

/**
 * The one place that implements the contract's mergeOrder: normalize raw
 * source -> apply WEB_BDS_OVERRIDES patch/hide -> append WEB_BDS_CUSTOM ->
 * (caller derives the public DTO separately, see dto.ts). Never writes
 * anything — this is a pure read-side merge.
 */
export async function buildMergedRentalData(
  source: RentalSourceProvider,
  overlay: RentalOverlayRepository,
): Promise<MergedRentalData> {
  const [rawRows, overrides, customRecords] = await Promise.all([
    source.listRawRows(),
    overlay.listOverrides(),
    overlay.listCustomRecords(),
  ]);

  const outcomes = parseRentalRows(rawRows);
  const overrideBySourceId = new Map<string, OverrideRecord>(overrides.map((o) => [o.sourceId, o]));

  let ignored = 0;
  let quarantined = 0;
  const quarantinedRows: { sourceRow: number; reason: string }[] = [];
  const mediaDiagnostics: { sourceRow: number; diagnostic: string }[] = [];
  const fromSource: AdminPropertyRecord[] = [];

  for (const outcome of outcomes) {
    if (outcome.kind === "ignored") {
      ignored++;
      continue;
    }
    if (outcome.kind === "quarantined") {
      quarantined++;
      quarantinedRows.push({ sourceRow: outcome.sourceRow, reason: outcome.reason });
      continue;
    }

    const record = outcome.record;
    const override = overrideBySourceId.get(record.sourceId);
    if (override?.hidden) continue;

    const { media, diagnostic } = await resolveLegacyMediaLink(record.mediaLink);
    if (diagnostic) mediaDiagnostics.push({ sourceRow: record.sourceRow, diagnostic });

    let admin: AdminPropertyRecord = {
      slug: slugForSourceRow(record.roomNo, record.sourceRow),
      roomNo: record.roomNo,
      location: record.location,
      address: record.address,
      price: record.price ?? 0,
      serviceFee: record.serviceFee,
      area: record.area ?? 0,
      verticalAccess: record.verticalAccess,
      propertyType: record.propertyType ?? "Nhà",
      description: record.description,
      highlights: record.highlights,
      availability: record.availability ?? "Còn trống",
      media,
      bedroomCount: record.bedroomCount,
      furnishingStatus: record.furnishingStatus,
      commission: record.commission,
      guidePerson: record.guidePerson,
      internalNotes: record.internalNotes,
      published: record.price !== null && record.area !== null,
      sourceId: record.sourceId,
    };

    if (override) {
      admin = { ...admin, ...(override.patch as Partial<AdminPropertyRecord>), sourceId: admin.sourceId };
    }

    fromSource.push(admin);
  }

  const fromCustom = customRecords.map(customToAdminRecord);

  return {
    admin: [...fromSource, ...fromCustom],
    diagnostics: { ignored, quarantined, quarantinedRows, mediaDiagnostics },
  };
}
