// One-time setup: push every required secret into the (freshly linked)
// Vercel project's Production environment. Reads the service-account key
// straight from its downloaded JSON — never retype a private key by hand.
//
// Usage (PowerShell, from the repo root, already `vercel link`-ed to the
// target project):
//   node scripts/setup-vercel-env.mjs `
//     --key "C:\path\to\service-account.json" `
//     --sheet "<id-google-sheet>" `
//     --admin-email "<email admin>" `
//     --admin-password "<mật khẩu admin>"
//
// Truyền mật khẩu qua tham số dòng lệnh, KHÔNG viết thẳng vào file này:
// mọi thứ nằm trong file đều đi vào lịch sử Git và không xoá lại được.

import { readFileSync } from "node:fs";
import { createPrivateKey, randomBytes, scryptSync } from "node:crypto";
import { spawnSync } from "node:child_process";

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const keyPath = arg("key");
const sheetId = arg("sheet");
const adminEmail = arg("admin-email");
const adminPassword = arg("admin-password");
const siteUrl = arg("site-url") ?? "https://ndthichland.com.vn";

if (!keyPath || !sheetId || !adminEmail || !adminPassword) {
  console.error("Thiếu tham số. Xem hướng dẫn ở đầu file này.");
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));
if (!serviceAccount.client_email || !serviceAccount.private_key) {
  console.error("File khoá thiếu client_email hoặc private_key.");
  process.exit(1);
}
try {
  createPrivateKey(serviceAccount.private_key);
} catch (e) {
  console.error("PEM không hợp lệ:", e.message);
  process.exit(1);
}

// Same scrypt params as lib/server/crypto/passwords.ts — must match exactly
// or the password just generated here will not be able to log in.
const N = 16384, R = 8, P = 1, KEY_LENGTH = 64;
function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, KEY_LENGTH, { N, r: R, p: P });
  return `scrypt:${N}:${R}:${P}:${salt.toString("hex")}:${derived.toString("hex")}`;
}

const privateKeyOneLine = serviceAccount.private_key.replace(/\r?\n/g, "\\n");
const authSecret = randomBytes(32).toString("hex");
const adminPasswordHash = hashPassword(adminPassword);

const vars = {
  GOOGLE_SERVICE_ACCOUNT_EMAIL: serviceAccount.client_email,
  GOOGLE_PRIVATE_KEY: privateKeyOneLine,
  GOOGLE_CMS_SPREADSHEET_ID: sheetId,
  GOOGLE_RENTAL_SPREADSHEET_ID: sheetId,
  ADMIN_EMAIL: adminEmail,
  ADMIN_PASSWORD_HASH: adminPasswordHash,
  AUTH_SECRET: authSecret,
  NEXT_PUBLIC_SITE_URL: siteUrl,
};

for (const [name, value] of Object.entries(vars)) {
  console.log(`\n--- ${name} ---`);
  spawnSync("vercel", ["env", "rm", name, "production", "--yes"], { stdio: "inherit", shell: true });
  const add = spawnSync("vercel", ["env", "add", name, "production"], {
    input: value,
    stdio: ["pipe", "inherit", "inherit"],
    shell: true,
  });
  if (add.status !== 0) {
    console.error(`FAILED setting ${name}`);
    process.exit(1);
  }
}

console.log("\n=====================================================");
console.log("Đã set xong toàn bộ biến môi trường Production.");
console.log(`client_email: ${serviceAccount.client_email}`);
console.log(`sheet id: ${sheetId}`);
console.log(`admin email: ${adminEmail}`);
console.log("Mật khẩu admin: giữ nguyên như anh đã cung cấp (không đổi).");
console.log("=====================================================");
console.log("\nTiếp theo: deploy production (vercel --prod).");
