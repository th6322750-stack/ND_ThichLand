// No "server-only" guard — see lib/server/env.ts for why.
import { readSheetRange, appendSheetRow, updateSheetRange } from "@/lib/server/google/sheets";
import { requireGoogleSpreadsheetEnv } from "@/lib/server/env";
import { CMS_TABS } from "@/lib/server/cmsSheetSchema";

export interface OverrideRecord {
  sourceId: string;
  patch: Record<string, unknown>;
  hidden: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface CustomBdsRecord {
  id: string;
  slug: string;
  roomNo: string;
  location: string;
  address: string;
  price: number | null;
  serviceFee: string;
  area: number | null;
  verticalAccess: string;
  propertyType: string;
  description: string;
  highlights: string[];
  availability: string;
  bedroomCount: number | null;
  furnishingStatus: string | null;
  media: string[];
  commission: string;
  guidePerson: string;
  internalNotes: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  // Appended at the end of the row (not inserted mid-sequence) so existing
  // WEB_BDS_CUSTOM rows in the live sheet keep their column alignment —
  // an old row simply has no cell here, which reads back as null.
  bathroomCount: number | null;
}

export interface RentalOverlayRepository {
  listOverrides(): Promise<OverrideRecord[]>;
  upsertOverride(override: OverrideRecord): Promise<void>;
  listCustomRecords(): Promise<CustomBdsRecord[]>;
  upsertCustomRecord(record: CustomBdsRecord): Promise<void>;
  /** Contract: "customRecord soft delete preferred" — clears `published`, never removes the row. */
  softDeleteCustomRecord(id: string): Promise<void>;
}

function safeJsonArray(json: string | undefined): string[] {
  if (!json) return [];
  try {
    const value = JSON.parse(json);
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function overrideRowToRecord(row: string[]): OverrideRecord | null {
  const [sourceId, patchJson, hidden, updatedAt, updatedBy] = row;
  if (!sourceId) return null;
  let patch: Record<string, unknown> = {};
  try {
    patch = patchJson ? JSON.parse(patchJson) : {};
  } catch {
    patch = {};
  }
  return { sourceId, patch, hidden: hidden === "true", updatedAt: updatedAt ?? "", updatedBy: updatedBy ?? "" };
}

function overrideRecordToRow(o: OverrideRecord): (string | number)[] {
  return [o.sourceId, JSON.stringify(o.patch), String(o.hidden), o.updatedAt, o.updatedBy];
}

function customRowToRecord(row: string[]): CustomBdsRecord | null {
  const [
    id,
    slug,
    roomNo,
    location,
    address,
    price,
    serviceFee,
    area,
    verticalAccess,
    propertyType,
    description,
    highlightsJson,
    availability,
    bedroomCount,
    furnishingStatus,
    mediaJson,
    commission,
    guidePerson,
    internalNotes,
    published,
    createdAt,
    updatedAt,
    bathroomCount,
  ] = row;
  if (!id) return null;
  return {
    id,
    slug: slug ?? "",
    roomNo: roomNo ?? "",
    location: location ?? "",
    address: address ?? "",
    price: price ? Number(price) : null,
    serviceFee: serviceFee ?? "",
    area: area ? Number(area) : null,
    verticalAccess: verticalAccess ?? "",
    propertyType: propertyType ?? "",
    description: description ?? "",
    highlights: safeJsonArray(highlightsJson),
    availability: availability ?? "",
    bedroomCount: bedroomCount ? Number(bedroomCount) : null,
    furnishingStatus: furnishingStatus || null,
    media: safeJsonArray(mediaJson),
    commission: commission ?? "",
    guidePerson: guidePerson ?? "",
    internalNotes: internalNotes ?? "",
    published: published === "true",
    createdAt: createdAt ?? "",
    updatedAt: updatedAt ?? "",
    bathroomCount: bathroomCount ? Number(bathroomCount) : null,
  };
}

function customRecordToRow(r: CustomBdsRecord): (string | number)[] {
  return [
    r.id,
    r.slug,
    r.roomNo,
    r.location,
    r.address,
    r.price ?? "",
    r.serviceFee,
    r.area ?? "",
    r.verticalAccess,
    r.propertyType,
    r.description,
    JSON.stringify(r.highlights),
    r.availability,
    r.bedroomCount ?? "",
    r.furnishingStatus ?? "",
    JSON.stringify(r.media),
    r.commission,
    r.guidePerson,
    r.internalNotes,
    String(r.published),
    r.createdAt,
    r.updatedAt,
    r.bathroomCount ?? "",
  ];
}

export class GoogleRentalOverlayRepository implements RentalOverlayRepository {
  async listOverrides(): Promise<OverrideRecord[]> {
    const { cmsSpreadsheetId } = requireGoogleSpreadsheetEnv();
    const values = await readSheetRange(cmsSpreadsheetId, `${CMS_TABS.bdsOverrides}!A2:E`);
    return values.map(overrideRowToRecord).filter((r): r is OverrideRecord => r !== null);
  }

  async upsertOverride(override: OverrideRecord): Promise<void> {
    const { cmsSpreadsheetId } = requireGoogleSpreadsheetEnv();
    const values = await readSheetRange(cmsSpreadsheetId, `${CMS_TABS.bdsOverrides}!A2:E`);
    const rowIndex = values.findIndex((row) => row[0] === override.sourceId);
    const row = overrideRecordToRow(override);
    if (rowIndex >= 0) {
      await updateSheetRange(cmsSpreadsheetId, `${CMS_TABS.bdsOverrides}!A${rowIndex + 2}:E${rowIndex + 2}`, row);
    } else {
      await appendSheetRow(cmsSpreadsheetId, CMS_TABS.bdsOverrides, row);
    }
  }

  async listCustomRecords(): Promise<CustomBdsRecord[]> {
    const { cmsSpreadsheetId } = requireGoogleSpreadsheetEnv();
    const values = await readSheetRange(cmsSpreadsheetId, `${CMS_TABS.bdsCustom}!A2:W`);
    return values.map(customRowToRecord).filter((r): r is CustomBdsRecord => r !== null);
  }

  async upsertCustomRecord(record: CustomBdsRecord): Promise<void> {
    const { cmsSpreadsheetId } = requireGoogleSpreadsheetEnv();
    const values = await readSheetRange(cmsSpreadsheetId, `${CMS_TABS.bdsCustom}!A2:W`);
    const rowIndex = values.findIndex((row) => row[0] === record.id);
    const row = customRecordToRow(record);
    if (rowIndex >= 0) {
      await updateSheetRange(cmsSpreadsheetId, `${CMS_TABS.bdsCustom}!A${rowIndex + 2}:W${rowIndex + 2}`, row);
    } else {
      await appendSheetRow(cmsSpreadsheetId, CMS_TABS.bdsCustom, row);
    }
  }

  async softDeleteCustomRecord(id: string): Promise<void> {
    const records = await this.listCustomRecords();
    const existing = records.find((r) => r.id === id);
    if (!existing) return;
    await this.upsertCustomRecord({ ...existing, published: false, updatedAt: new Date().toISOString() });
  }
}

export class InMemoryRentalOverlayRepository implements RentalOverlayRepository {
  private readonly overrides = new Map<string, OverrideRecord>();
  private readonly custom = new Map<string, CustomBdsRecord>();

  async listOverrides(): Promise<OverrideRecord[]> {
    return [...this.overrides.values()];
  }

  async upsertOverride(o: OverrideRecord): Promise<void> {
    this.overrides.set(o.sourceId, o);
  }

  async listCustomRecords(): Promise<CustomBdsRecord[]> {
    return [...this.custom.values()];
  }

  async upsertCustomRecord(r: CustomBdsRecord): Promise<void> {
    this.custom.set(r.id, r);
  }

  async softDeleteCustomRecord(id: string): Promise<void> {
    const existing = this.custom.get(id);
    if (existing) this.custom.set(id, { ...existing, published: false, updatedAt: new Date().toISOString() });
  }
}
