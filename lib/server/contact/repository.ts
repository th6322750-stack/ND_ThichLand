// No "server-only" guard — see lib/server/env.ts for why.
import { readSheetRange, appendSheetRow } from "@/lib/server/google/sheets";
import { requireGoogleSpreadsheetEnv } from "@/lib/server/env";
import { CMS_TABS } from "@/lib/server/cmsSheetSchema";

export interface ContactRecord {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  need: string;
  area: string;
  message: string;
  status: string;
  /** HMAC-SHA256 of the submitter's IP — the raw IP is never stored (see rateLimit.ts). */
  ipHash: string;
}

export interface ContactRepository {
  list(): Promise<ContactRecord[]>;
  create(record: ContactRecord): Promise<void>;
}

function rowToRecord(row: string[]): ContactRecord | null {
  const [id, createdAt, name, phone, need, area, message, status, ipHash] = row;
  if (!id) return null;
  return {
    id,
    createdAt: createdAt ?? "",
    name: name ?? "",
    phone: phone ?? "",
    need: need ?? "",
    area: area ?? "",
    message: message ?? "",
    status: status ?? "new",
    ipHash: ipHash ?? "",
  };
}

function recordToRow(r: ContactRecord): string[] {
  return [r.id, r.createdAt, r.name, r.phone, r.need, r.area, r.message, r.status, r.ipHash];
}

export class GoogleContactRepository implements ContactRepository {
  async list(): Promise<ContactRecord[]> {
    const { cmsSpreadsheetId } = requireGoogleSpreadsheetEnv();
    const values = await readSheetRange(cmsSpreadsheetId, `${CMS_TABS.contacts}!A2:I`);
    return values.map(rowToRecord).filter((r): r is ContactRecord => r !== null);
  }

  async create(record: ContactRecord): Promise<void> {
    const { cmsSpreadsheetId } = requireGoogleSpreadsheetEnv();
    await appendSheetRow(cmsSpreadsheetId, CMS_TABS.contacts, recordToRow(record));
  }
}

export class InMemoryContactRepository implements ContactRepository {
  private readonly records: ContactRecord[] = [];

  async list(): Promise<ContactRecord[]> {
    return [...this.records];
  }

  async create(record: ContactRecord): Promise<void> {
    this.records.push(record);
  }
}
