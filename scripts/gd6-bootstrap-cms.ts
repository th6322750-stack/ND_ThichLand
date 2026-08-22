// Idempotent CMS spreadsheet bootstrap — creates any missing WEB_* tabs
// (with their header row) in GOOGLE_CMS_SPREADSHEET_ID. Safe to re-run: it
// adds tabs that don't already exist and safely appends new header columns
// when an existing header is an exact prefix of the current schema. It never
// rewrites data rows or a mismatched header. Never touches the raw
// "Phòng trống chính " rental sheet — it has no code path to it at all.
//
// Usage: npm run gd6:bootstrap-cms
import { createSheetTabWithHeader, listSheetTitles, readSheetRange, updateSheetRange } from "../lib/server/google/sheets";
import { CMS_HEADERS } from "../lib/server/cmsSheetSchema";
import { getGoogleSpreadsheetEnv, isGoogleRuntimeConfigured } from "../lib/server/env";

function columnName(count: number): string {
  let n = count;
  let result = "";
  while (n > 0) {
    n -= 1;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
}

export async function bootstrapCms(
  log: (line: string) => void = console.log,
): Promise<{ created: string[]; existing: string[]; extended: string[] }> {
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
  const extended: string[] = [];

  for (const [tabName, headerRow] of Object.entries(CMS_HEADERS)) {
    if (existingTitles.has(tabName)) {
      existing.push(tabName);
      const currentHeader = (await readSheetRange(cmsSpreadsheetId, `${tabName}!1:1`))[0] ?? [];
      const isExactPrefix = currentHeader.every((cell, index) => cell === headerRow[index]);
      if (isExactPrefix && currentHeader.length < headerRow.length) {
        await updateSheetRange(cmsSpreadsheetId, `${tabName}!A1:${columnName(headerRow.length)}1`, headerRow);
        extended.push(tabName);
        log(`  ~ ${tabName} (header extended ${currentHeader.length} -> ${headerRow.length} columns)`);
      } else if (!isExactPrefix) {
        log(`  ! ${tabName} (header differs from schema; left untouched for manual review)`);
      } else {
        log(`  = ${tabName} (already up to date)`);
      }
      continue;
    }
    await createSheetTabWithHeader(cmsSpreadsheetId, tabName, headerRow);
    log(`  + ${tabName} (created with ${headerRow.length} header columns)`);
    created.push(tabName);
  }

  log("Done. The raw rental sheet was never opened by this script.");
  return { created, existing, extended };
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
