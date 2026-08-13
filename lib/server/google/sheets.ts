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
    valueInputOption: "USER_ENTERED",
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
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
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
