// No "server-only" guard — see lib/server/env.ts for why.
import { google, type sheets_v4 } from "googleapis";
import { getGoogleAuthClient } from "./auth";

let cachedClient: sheets_v4.Sheets | null = null;

function getClient(): sheets_v4.Sheets {
  if (cachedClient) return cachedClient;
  cachedClient = google.sheets({ version: "v4", auth: getGoogleAuthClient() });
  return cachedClient;
}

// Google Sheets caps reads at ~60/minute per project on the free tier, and
// every domain (rental/projects/news/settings/page content) re-reads its
// tabs on every single page view — a handful of real visitors browsing
// within the same minute exhausts that quota and 500s the entire site
// (confirmed live on the first day this app read a real spreadsheet).
// Cached through Next's shared Data Cache, not per-instance memory, so
// concurrently-scaled serverless instances all see the same cached result
// instead of each instance doing its own first-hit read against Sheets.
const SHEETS_CACHE_TAG = "google-sheets-read";
const SHEETS_CACHE_TTL_SECONDS = 30;

// unstable_cache only starts sharing a result once the FIRST call to
// populate it has finished — a burst of concurrent requests that all arrive
// before that first read completes (or right as the 30s TTL lapses) each
// see a miss and each fire their own Sheets read, which is its own path to
// the same quota crash this cache exists to prevent (confirmed: 3 failures
// out of 30 concurrent requests with only the TTL cache in place). Within
// one serverless instance, coalesce concurrent reads of the same range into
// the single in-flight promise instead of letting each one call the API.
const inFlightReads = new Map<string, Promise<string[][]>>();

async function readSheetRangeDirect(spreadsheetId: string, range: string): Promise<string[][]> {
  const key = `${spreadsheetId}::${range}`;
  const existing = inFlightReads.get(key);
  if (existing) return existing;
  const promise = (async () => {
    const client = getClient();
    const res = await client.spreadsheets.values.get({ spreadsheetId, range });
    return (res.data.values ?? []) as string[][];
  })();
  inFlightReads.set(key, promise);
  try {
    return await promise;
  } finally {
    inFlightReads.delete(key);
  }
}

/** This module is also imported by standalone scripts run via `tsx`
 * (scripts/gd6-bootstrap-cms.ts and one-off data migrations) outside any
 * Next.js request — unstable_cache/revalidateTag need a request-scoped
 * store this module can't guarantee exists, so every cache operation below
 * falls back to the plain uncached call instead of throwing. */
export async function readSheetRange(spreadsheetId: string, range: string): Promise<string[][]> {
  try {
    const { unstable_cache } = await import("next/cache");
    const cached = unstable_cache(
      () => readSheetRangeDirect(spreadsheetId, range),
      ["read-sheet-range", spreadsheetId, range],
      { revalidate: SHEETS_CACHE_TTL_SECONDS, tags: [SHEETS_CACHE_TAG] },
    );
    return await cached();
  } catch {
    return readSheetRangeDirect(spreadsheetId, range);
  }
}

/** Called after every write below so an admin's own save is never masked by
 * a stale cached read — the next read of any tab re-fetches instead of
 * waiting out the 30s TTL. Broad (one shared tag for every tab) rather than
 * per-range: writes are rare next to reads, so invalidating everything on
 * any write is a fine trade for staying simple and correct. */
async function invalidateSheetsCache(): Promise<void> {
  try {
    const { revalidateTag } = await import("next/cache");
    revalidateTag(SHEETS_CACHE_TAG, "max");
  } catch {
    // Not in a Next.js request context (e.g. a standalone tsx script) — nothing to invalidate.
  }
}

export async function appendSheetRow(
  spreadsheetId: string,
  sheetName: string,
  row: (string | number)[],
): Promise<void> {
  const client = getClient();
  await client.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1`,
    // RAW, not USER_ENTERED: every repository writes "true"/"false" as plain
    // text and reads it back with a case-sensitive `=== "true"` comparison.
    // USER_ENTERED parses input the way a human typing into Sheets would —
    // "true"/"false" become the sheet's native Boolean type, which the API
    // then returns as the string "TRUE"/"FALSE", silently breaking every
    // published/hidden/showMasterplan flag on the very first real write.
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
  await invalidateSheetsCache();
}

export async function updateSheetRange(
  spreadsheetId: string,
  range: string,
  row: (string | number)[],
): Promise<void> {
  const client = getClient();
  await client.spreadsheets.values.update({
    spreadsheetId,
    range,
    // RAW — see appendSheetRow's comment above for why USER_ENTERED corrupts
    // the "true"/"false" strings this repository layer round-trips on.
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  });
  await invalidateSheetsCache();
}

export async function clearSheetRange(spreadsheetId: string, range: string): Promise<void> {
  const client = getClient();
  await client.spreadsheets.values.clear({ spreadsheetId, range });
  await invalidateSheetsCache();
}

export async function listSheetTitles(spreadsheetId: string): Promise<string[]> {
  const client = getClient();
  const res = await client.spreadsheets.get({ spreadsheetId });
  return (res.data.sheets ?? [])
    .map((s) => s.properties?.title)
    .filter((title): title is string => Boolean(title));
}

/** Creates the tab and writes its header row in one call. No-ops must be checked by the caller (listSheetTitles first) — never call this blindly, since re-creating an existing tab errors. */
export async function createSheetTabWithHeader(
  spreadsheetId: string,
  title: string,
  headerRow: string[],
): Promise<void> {
  const client = getClient();
  await client.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ addSheet: { properties: { title } } }] },
  });
  await updateSheetRange(spreadsheetId, `${title}!A1`, headerRow);
}
