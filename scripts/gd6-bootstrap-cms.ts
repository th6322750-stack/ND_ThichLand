// Idempotent CMS spreadsheet bootstrap — creates any missing WEB_* tabs
// (with their header row) in GOOGLE_CMS_SPREADSHEET_ID. Safe to re-run: it
// only ever adds tabs that don't already exist, and only ever writes A1:*
// header cells on tabs it just created. Never touches the raw
// "Phòng trống chính " rental sheet — it has no code path to it at all.
//
// Usage: npm run gd6:bootstrap-cms
import { listSheetTitles, createSheetTabWithHeader } from "../lib/server/google/sheets";
import { CMS_HEADERS } from "../lib/server/cmsSheetSchema";
import { getGoogleSpreadsheetEnv, isGoogleRuntimeConfigured } from "../lib/server/env";

export async function bootstrapCms(log: (line: string) => void = console.log): Promise<{ created: string[]; existing: string[] }> {
  if (!isGoogleRuntimeConfigured()) {
    throw new Error(
      "Refusing to run: GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY / GOOGLE_CMS_SPREADSHEET_ID " +
        "(and GOOGLE_RENTAL_SPREADSHEET_ID if overridden) are not fully configured.",
    );
  }

  const { cmsSpreadsheetId } = getGoogleSpreadsheetEnv()!;
  log(`Bootstrapping CMS tabs in spreadsheet ${cmsSpreadsheetId} ...`);

  const existingTitles = new Set(await listSheetTitles(cmsSpreadsheetId));
  const created: string[] = [];
  const existing: string[] = [];

  for (const [tabName, headerRow] of Object.entries(CMS_HEADERS)) {
    if (existingTitles.has(tabName)) {
      log(`  = ${tabName} (already exists, left untouched)`);
      existing.push(tabName);
      continue;
    }
    await createSheetTabWithHeader(cmsSpreadsheetId, tabName, headerRow);
    log(`  + ${tabName} (created with ${headerRow.length} header columns)`);
    created.push(tabName);
  }

  log("Done. The raw rental sheet was never opened by this script.");
  return { created, existing };
}

async function main() {
  try {
    await bootstrapCms();
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  void main();
}
