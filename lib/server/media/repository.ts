// No "server-only" guard — see lib/server/env.ts for why.
import { readSheetRange, appendSheetRow, clearSheetRange } from "@/lib/server/google/sheets";
import { requireGoogleSpreadsheetEnv } from "@/lib/server/env";
import { CMS_TABS } from "@/lib/server/cmsSheetSchema";

export interface MediaRecord {
  id: string;
  driveFileId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  webViewLink: string;
  uploadedBy: string;
  createdAt: string;
}

export interface MediaRepository {
  list(): Promise<MediaRecord[]>;
  create(record: MediaRecord): Promise<void>;
  remove(id: string): Promise<void>;
}

function rowToRecord(row: string[]): MediaRecord | null {
  const [id, driveFileId, filename, mimeType, sizeBytes, webViewLink, uploadedBy, createdAt] = row;
  if (!id) return null;
  return {
    id,
    driveFileId: driveFileId ?? "",
    filename: filename ?? "",
    mimeType: mimeType ?? "",
    sizeBytes: sizeBytes ? Number(sizeBytes) : 0,
    webViewLink: webViewLink ?? "",
    uploadedBy: uploadedBy ?? "",
    createdAt: createdAt ?? "",
  };
}

function recordToRow(r: MediaRecord): (string | number)[] {
  return [r.id, r.driveFileId, r.filename, r.mimeType, r.sizeBytes, r.webViewLink, r.uploadedBy, r.createdAt];
}

export class GoogleMediaRepository implements MediaRepository {
  async list(): Promise<MediaRecord[]> {
    const { cmsSpreadsheetId } = requireGoogleSpreadsheetEnv();
    const values = await readSheetRange(cmsSpreadsheetId, `${CMS_TABS.media}!A2:H`);
    return values.map(rowToRecord).filter((r): r is MediaRecord => r !== null);
  }

  async create(record: MediaRecord): Promise<void> {
    const { cmsSpreadsheetId } = requireGoogleSpreadsheetEnv();
    await appendSheetRow(cmsSpreadsheetId, CMS_TABS.media, recordToRow(record));
  }

  async remove(id: string): Promise<void> {
    // WEB_MEDIA has no soft-delete concept (unlike published content) —
    // the catalog row is only useful while the underlying blob exists.
    const { cmsSpreadsheetId } = requireGoogleSpreadsheetEnv();
    const values = await readSheetRange(cmsSpreadsheetId, `${CMS_TABS.media}!A2:H`);
    const rowIndex = values.findIndex((row) => row[0] === id);
    if (rowIndex < 0) return;
    await clearSheetRange(cmsSpreadsheetId, `${CMS_TABS.media}!A${rowIndex + 2}:H${rowIndex + 2}`);
  }
}

export class InMemoryMediaRepository implements MediaRepository {
  private readonly records = new Map<string, MediaRecord>();

  async list(): Promise<MediaRecord[]> {
    return [...this.records.values()];
  }

  async create(record: MediaRecord): Promise<void> {
    this.records.set(record.id, record);
  }

  async remove(id: string): Promise<void> {
    this.records.delete(id);
  }
}
