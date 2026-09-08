// No "server-only" guard — see lib/server/env.ts for why.
import { google, type sheets_v4 } from "googleapis";
import { getGoogleAuthClient } from "./auth";

let cachedClient: sheets_v4.Sheets | null = null;

function getClient(): sheets_v4.Sheets {
  if (cachedClient) return cachedClient;
  cachedClient = google.sheets({ version: "v4", auth: getGoogleAuthClient() });
  return cachedClient;
}

export async function readSheetRange(spreadsheetId: string, range: string): Promise<string[][]> {
  const client = getClient();
  const res = await client.spreadsheets.values.get({ spreadsheetId, range });
  return (res.data.values ?? []) as string[][];
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
}

export async function clearSheetRange(spreadsheetId: string, range: string): Promise<void> {
  const client = getClient();
  await client.spreadsheets.values.clear({ spreadsheetId, range });
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
