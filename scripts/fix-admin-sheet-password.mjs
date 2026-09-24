// The CMS Sheet's WEB_ADMIN_SECURITY row overrides the env-var admin
// password once it exists (see lib/server/auth/security.ts). Setting
// ADMIN_PASSWORD_HASH in Vercel alone does nothing while that row is
// already there — this script rewrites the row itself instead.
//
// Usage (PowerShell, from the repo root):
//   node scripts/fix-admin-sheet-password.mjs `
//     --key "C:\path\to\service-account.json" `
//     --sheet "<id-google-sheet>" `
//     --password "<mật khẩu admin>"
//
// Truyền mật khẩu qua tham số dòng lệnh, KHÔNG viết thẳng vào file này:
// mọi thứ nằm trong file đều đi vào lịch sử Git và không xoá lại được.

import { readFileSync } from "node:fs";
import { scryptSync, randomBytes } from "node:crypto";
import { google } from "googleapis";

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const keyPath = arg("key");
const sheetId = arg("sheet");
const password = arg("password");
if (!keyPath || !sheetId || !password) {
  console.error("Usage: node scripts/fix-admin-sheet-password.mjs --key <json> --sheet <id> --password <plaintext>");
  process.exit(1);
}

const N = 16384, R = 8, P = 1, KEY_LENGTH = 64;
function hashPassword(pw) {
  const salt = randomBytes(16);
  const derived = scryptSync(pw, salt, KEY_LENGTH, { N, r: R, p: P });
  return `scrypt:${N}:${R}:${P}:${salt.toString("hex")}:${derived.toString("hex")}`;
}

const key = JSON.parse(readFileSync(keyPath, "utf8"));
const auth = new google.auth.JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

const range = "WEB_ADMIN_SECURITY!A2:D2";
const existing = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
const currentRow = existing.data.values?.[0];
// Preserve TOTP state exactly as-is — this script only replaces the password.
const totpSecretCiphertext = currentRow?.[1] ?? "";
const totpEnabled = currentRow?.[2] ?? "false";

const newRow = [hashPassword(password), totpSecretCiphertext, totpEnabled, new Date().toISOString()];

await sheets.spreadsheets.values.update({
  spreadsheetId: sheetId,
  range,
  valueInputOption: "RAW",
  requestBody: { values: [newRow] },
});

console.log("Đã cập nhật WEB_ADMIN_SECURITY trong Sheet.");
console.log("totpEnabled giữ nguyên:", totpEnabled);
console.log("Đăng nhập lại bằng mật khẩu vừa cung cấp sẽ có hiệu lực ngay (không cần deploy lại).");
