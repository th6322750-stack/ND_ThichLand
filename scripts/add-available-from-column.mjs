// Adds the `available_from` header column to the live WEB_BDS_CUSTOM tab.
//
// The app now writes 27 cells per custom listing. A Google Sheet is 26
// columns (A..Z) wide by default, so without this the first save after
// deploying fails with "exceeds grid limits" — or silently loses the value.
//
// Safe to run twice: it checks for the header first and does nothing if it
// is already there.
//
// Usage (PowerShell, from the repo root):
//   node scripts/add-available-from-column.mjs `
//     --key "C:\path\to\service-account.json" `
//     --sheet "<id-google-sheet>"

import { readFileSync } from "node:fs";
import { google } from "googleapis";

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const keyPath = arg("key");
const spreadsheetId = arg("sheet");
if (!keyPath || !spreadsheetId) {
  console.error("Usage: node scripts/add-available-from-column.mjs --key <json> --sheet <id>");
  process.exit(1);
}

const TAB = "WEB_BDS_CUSTOM";
const HEADER = "available_from";
const MIN_COLUMNS = 30; // 27 in use, a little headroom for the next field

const key = JSON.parse(readFileSync(keyPath, "utf8"));
const auth = new google.auth.JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

const meta = await sheets.spreadsheets.get({ spreadsheetId });
const tab = meta.data.sheets?.find((s) => s.properties?.title === TAB);
if (!tab) {
  console.error(`Không tìm thấy tab "${TAB}" trong Sheet này.`);
  process.exit(1);
}

const columnCount = tab.properties?.gridProperties?.columnCount ?? 0;
console.log(`Tab "${TAB}" hiện có ${columnCount} cột.`);

const headerRow = await sheets.spreadsheets.values.get({
  spreadsheetId,
  range: `${TAB}!1:1`,
});
const headers = headerRow.data.values?.[0] ?? [];
console.log(`Đang có ${headers.length} tiêu đề cột.`);

if (headers.includes(HEADER)) {
  console.log(`Cột "${HEADER}" đã tồn tại — không cần làm gì thêm.`);
  process.exit(0);
}

if (columnCount < MIN_COLUMNS) {
  console.log(`Thêm ${MIN_COLUMNS - columnCount} cột trống...`);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          appendDimension: {
            sheetId: tab.properties.sheetId,
            dimension: "COLUMNS",
            length: MIN_COLUMNS - columnCount,
          },
        },
      ],
    },
  });
}

// Fixed columns W..AA (23..27), NOT "after the last header". The four
// fields before this one were written by the repository for a long time
// without ever being declared in CMS_HEADERS, so the live sheet can hold
// data in columns 23-26 under blank headers — and appending after
// `headers.length` would then drop available_from into column W, silently
// misaligned with the cell order overlay.ts writes.
const TRAILING_HEADERS = [
  "bathroom_count",
  "amenities_json",
  "location_note",
  "video_url",
  HEADER,
];
await sheets.spreadsheets.values.update({
  spreadsheetId,
  range: `${TAB}!W1:AA1`,
  valueInputOption: "RAW",
  requestBody: { values: [TRAILING_HEADERS] },
});

console.log(`Đã ghi tiêu đề cột 23-27 (W1:AA1): ${TRAILING_HEADERS.join(", ")}`);

const verify = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${TAB}!1:1` });
console.log("Tiêu đề sau khi cập nhật:", (verify.data.values?.[0] ?? []).join(" | "));
