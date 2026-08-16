// No "server-only" guard — see lib/server/env.ts for why.
import { readSheetRange, appendSheetRow, updateSheetRange } from "@/lib/server/google/sheets";
import { requireGoogleSpreadsheetEnv } from "@/lib/server/env";
import { CMS_TABS } from "@/lib/server/cmsSheetSchema";
import { parseProjectStatus } from "@/lib/projectStatus";
import type { ProjectListing } from "@/lib/types";

export interface ProjectRecord extends ProjectListing {
  id: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRepository {
  list(): Promise<ProjectRecord[]>;
  upsert(record: ProjectRecord): Promise<void>;
  softDelete(id: string): Promise<void>;
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

function safeProgressPhotos(json: string | undefined): { label: string; image: string }[] {
  if (!json) return [];
  try {
    const value = JSON.parse(json);
    if (!Array.isArray(value)) return [];
    return value.filter(
      (v): v is { label: string; image: string } =>
        typeof v === "object" && v !== null && typeof v.label === "string" && typeof v.image === "string",
    );
  } catch {
    return [];
  }
}

/** Clamped to 0-100: the value drives a milestone indicator, and a stray
    "550" or "-3" in the sheet would otherwise index past the last step. */
function safeProgressPercent(raw: string | undefined): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function rowToRecord(row: string[]): ProjectRecord | null {
  const [
    id,
    slug,
    name,
    location,
    investor,
    status,
    summary,
    amenitiesJson,
    progressText,
    progressPercent,
    mediaJson,
    published,
    createdAt,
    updatedAt,
    progressPhotosJson,
  ] = row;
  if (!id) return null;
  return {
    id,
    slug: slug ?? "",
    name: name ?? "",
    location: location ?? "",
    investor: investor ?? "",
    // An empty/unrecognized cell stays null ("chưa biết") instead of being
    // promoted to "Đang triển khai" — see lib/projectStatus.ts.
    status: parseProjectStatus(status),
    summary: summary ?? "",
    amenities: safeJsonArray(amenitiesJson),
    progressText: progressText ?? "",
    progressPercent: safeProgressPercent(progressPercent),
    media: safeJsonArray(mediaJson),
    published: published === "true",
    createdAt: createdAt ?? "",
    updatedAt: updatedAt ?? "",
    // Appended at the end of the row (not inserted mid-sequence) so
    // existing WEB_PROJECTS rows keep their column alignment.
    progressPhotos: safeProgressPhotos(progressPhotosJson),
  };
}

function recordToRow(r: ProjectRecord): (string | number)[] {
  return [
    r.id,
    r.slug,
    r.name,
    r.location,
    r.investor,
    r.status ?? "",
    r.summary,
    JSON.stringify(r.amenities),
    r.progressText,
    r.progressPercent,
    JSON.stringify(r.media),
    String(r.published),
    r.createdAt,
    r.updatedAt,
    JSON.stringify(r.progressPhotos),
  ];
}

export class GoogleProjectRepository implements ProjectRepository {
  async list(): Promise<ProjectRecord[]> {
    const { cmsSpreadsheetId } = requireGoogleSpreadsheetEnv();
    const values = await readSheetRange(cmsSpreadsheetId, `${CMS_TABS.projects}!A2:O`);
    return values.map(rowToRecord).filter((r): r is ProjectRecord => r !== null);
  }

  async upsert(record: ProjectRecord): Promise<void> {
    const { cmsSpreadsheetId } = requireGoogleSpreadsheetEnv();
    const values = await readSheetRange(cmsSpreadsheetId, `${CMS_TABS.projects}!A2:O`);
    const rowIndex = values.findIndex((row) => row[0] === record.id);
    const row = recordToRow(record);
    if (rowIndex >= 0) {
      await updateSheetRange(cmsSpreadsheetId, `${CMS_TABS.projects}!A${rowIndex + 2}:O${rowIndex + 2}`, row);
    } else {
      await appendSheetRow(cmsSpreadsheetId, CMS_TABS.projects, row);
    }
  }

  async softDelete(id: string): Promise<void> {
    const records = await this.list();
    const existing = records.find((r) => r.id === id);
    if (!existing) return;
    await this.upsert({ ...existing, published: false, updatedAt: new Date().toISOString() });
  }
}

export class InMemoryProjectRepository implements ProjectRepository {
  private readonly records = new Map<string, ProjectRecord>();

  async list(): Promise<ProjectRecord[]> {
    return [...this.records.values()];
  }

  async upsert(record: ProjectRecord): Promise<void> {
    this.records.set(record.id, record);
  }

  async softDelete(id: string): Promise<void> {
    const existing = this.records.get(id);
    if (existing) this.records.set(id, { ...existing, published: false, updatedAt: new Date().toISOString() });
  }
}
