import "server-only";
import { appendSheetRow, readSheetRange, updateSheetRange } from "@/lib/server/google/sheets";
import { requireGoogleSpreadsheetEnv } from "@/lib/server/env";
import { CMS_TABS } from "@/lib/server/cmsSheetSchema";

export interface AdminSecurityRecord {
  passwordHash: string;
  totpSecretCiphertext: string;
  totpEnabled: boolean;
  updatedAt: string;
}

export interface AdminSecurityRepository {
  get(): Promise<AdminSecurityRecord | null>;
  save(record: AdminSecurityRecord): Promise<void>;
}

const RANGE = `${CMS_TABS.adminSecurity}!A2:D2`;

function rowToRecord(row: string[] | undefined): AdminSecurityRecord | null {
  if (!row?.length || !row[0]?.trim()) return null;
  return {
    passwordHash: row[0].trim(),
    totpSecretCiphertext: row[1]?.trim() ?? "",
    totpEnabled: row[2]?.trim().toLowerCase() === "true",
    updatedAt: row[3]?.trim() ?? "",
  };
}

function recordToRow(record: AdminSecurityRecord): string[] {
  return [
    record.passwordHash,
    record.totpSecretCiphertext,
    String(record.totpEnabled),
    record.updatedAt,
  ];
}

export class GoogleAdminSecurityRepository implements AdminSecurityRepository {
  async get(): Promise<AdminSecurityRecord | null> {
    const { cmsSpreadsheetId } = requireGoogleSpreadsheetEnv();
    const rows = await readSheetRange(cmsSpreadsheetId, RANGE);
    return rowToRecord(rows[0]);
  }

  async save(record: AdminSecurityRecord): Promise<void> {
    const { cmsSpreadsheetId } = requireGoogleSpreadsheetEnv();
    const rows = await readSheetRange(cmsSpreadsheetId, RANGE);
    if (rows.length > 0) {
      await updateSheetRange(cmsSpreadsheetId, RANGE, recordToRow(record));
    } else {
      await appendSheetRow(cmsSpreadsheetId, CMS_TABS.adminSecurity, recordToRow(record));
    }
  }
}

export class InMemoryAdminSecurityRepository implements AdminSecurityRepository {
  private record: AdminSecurityRecord | null = null;

  async get(): Promise<AdminSecurityRecord | null> {
    return this.record ? { ...this.record } : null;
  }

  async save(record: AdminSecurityRecord): Promise<void> {
    this.record = { ...record };
  }
}
