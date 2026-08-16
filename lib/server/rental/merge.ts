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

// GĐ6 QA reopen (defect 01): never fabricate a plausible-looking default —
// an unrecognized value becomes null (unknown), never silently "Nhà"/"Còn
// trống". Applies to WEB_BDS_CUSTOM records exactly the same as raw sheet
// rows; the value only ever reaches here as a raw string (from a Sheet
// cell), so it still needs validating even though app/actions/bds.ts also
// validates admin-submitted input before it's ever written.
function coercePropertyType(value: string): PropertyType | null {
  return (KNOWN_PROPERTY_TYPES as string[]).includes(value) ? (value as PropertyType) : null;
}

function coerceAvailability(value: string): Availability | null {
  return (KNOWN_AVAILABILITY as string[]).includes(value) ? (value as Availability) : null;
}

/**
 * The single publish-eligibility gate (contract: never publish a raw or
 * custom record with a fabricated/unknown price, area, availability, or
 * propertyType). Applied LAST, after any override patch has been merged
 * in — an admin explicitly requesting "publish" (published: true in a
 * patch) is intent, not proof of validity; this still forces the record
 * back to unpublished if the underlying fields aren't actually valid, so
 * there's no way to publish a fabricated-looking record just by clicking
 * "Lưu & đăng" without ever fixing the fields themselves.
 */
function isEligibleToPublish(record: AdminPropertyRecord): boolean {
  return record.price > 0 && record.area > 0 && record.availability !== null && record.propertyType !== null;
}

function customToAdminRecord(c: CustomBdsRecord): AdminPropertyRecord {
  const record: AdminPropertyRecord = {
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
    bathroomCount: c.bathroomCount,
    commission: c.commission,
    guidePerson: c.guidePerson,
    internalNotes: c.internalNotes,
    published: c.published,
  };
  record.published = record.published && isEligibleToPublish(record);
  return record;
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
      // Never fabricated (contract, defect 01) — an unparseable/unrecognized
      // raw value stays null ("unknown"), never a plausible-looking default.
      propertyType: record.propertyType,
      description: record.description,
      highlights: record.highlights,
      availability: record.availability,
      media,
      bedroomCount: record.bedroomCount,
      furnishingStatus: record.furnishingStatus,
      // No sheet column/parser exists for this — a source-derived record
      // always starts null; an admin override patch is the only way to set
      // it (same as any other admin correction to a sheet row).
      bathroomCount: null,
      commission: record.commission,
      guidePerson: record.guidePerson,
      internalNotes: record.internalNotes,
      // Provisional — isEligibleToPublish() below is the real, final gate,
      // applied after any override patch so an Admin override can't just
      // assert published:true without the underlying fields being valid.
      published: true,
      sourceId: record.sourceId,
    };

    if (override) {
      admin = { ...admin, ...(override.patch as Partial<AdminPropertyRecord>), sourceId: admin.sourceId };
    }
    admin.published = admin.published && isEligibleToPublish(admin);

    fromSource.push(admin);
  }

  const fromCustom = customRecords.map(customToAdminRecord);

  return {
    admin: [...fromSource, ...fromCustom],
    diagnostics: { ignored, quarantined, quarantinedRows, mediaDiagnostics },
  };
}
