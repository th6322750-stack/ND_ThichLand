#!/usr/bin/env node
// Sinh file .env cho VPS từ khoá service account của Google.
//
// Có script này vì bên nhận bàn giao không có quyền vào Vercel để tự lấy biến
// môi trường, mà gõ tay khoá riêng thì sai một ký tự là hỏng (đã xảy ra thật).
// Script đọc thẳng file JSON Google tải về nên không ai phải chép tay.
//
// Đồng thời sinh MẬT KHẨU ADMIN MỚI: mật khẩu đang dùng đã nằm dạng chữ trong
// tài liệu PDF và trong lịch sử chat, không nên mang sang máy mới.
//
// Dùng:
//   node scripts/make-vps-env.mjs \
//     --key "C:/duong/dan/service-account.json" \
//     --sheet "<id-google-sheet>" \
//     --admin-email "admin@ndthichland.com.vn" \
//     --out "C:/duong/dan/ndthichland-vps.env"
//
// File sinh ra CHỨA BÍ MẬT: không đưa vào git, không gửi qua chat nhóm.
import { readFileSync, writeFileSync } from "node:fs";
import { randomBytes, scryptSync } from "node:crypto";

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

const keyPath = arg("key");
const sheetId = arg("sheet");
const adminEmail = arg("admin-email");
const outPath = arg("out");
const siteUrl = arg("site-url") ?? "https://ndthichland.com.vn";

if (!keyPath || !sheetId || !adminEmail || !outPath) {
  console.error("Thiếu tham số. Xem hướng dẫn ở đầu file này.");
  console.error('  node scripts/make-vps-env.mjs --key <json> --sheet <id> --admin-email <email> --out <file>');
  process.exit(1);
}

// Cùng tham số scrypt với lib/server/crypto/passwords.ts — đổi ở đây mà không
// đổi bên đó là mật khẩu sinh ra sẽ không đăng nhập được.
const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;

function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, KEY_LENGTH, { N, r: R, p: P });
  return `scrypt:${N}:${R}:${P}:${salt.toString("hex")}:${derived.toString("hex")}`;
}

// Bỏ các ký tự dễ nhìn nhầm (0/O, 1/l/I) để đọc qua điện thoại không sai.
function newPassword(length = 20) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));
} catch (err) {
  console.error(`Không đọc được file khoá: ${keyPath}`);
  console.error(String(err.message ?? err));
  process.exit(1);
}

if (!serviceAccount.client_email || !serviceAccount.private_key) {
  console.error("File khoá thiếu client_email hoặc private_key — có đúng file JSON service account không?");
  process.exit(1);
}

// systemd EnvironmentFile không đọc được giá trị nhiều dòng. Khoá riêng phải
// nằm trên một dòng với \n; lib/server/env.ts tự chuyển ngược lại khi chạy.
const privateKeyOneLine = serviceAccount.private_key.replace(/\r?\n/g, "\\n");
const adminPassword = newPassword();
const adminPasswordHash = hashPassword(adminPassword);
const authSecret = randomBytes(32).toString("hex");

const content = `# NDTHICH LAND — biến môi trường VPS (GIÁ TRỊ THẬT)
# Sinh ngày ${new Date().toISOString().slice(0, 10)}
# KHÔNG đưa file này vào git. KHÔNG gửi qua chat nhóm.
# Đặt tại /opt/ndthichland/.env rồi: chmod 600 /opt/ndthichland/.env

NODE_ENV=production
PORT=3000
HOSTNAME=127.0.0.1
NEXT_PUBLIC_SITE_URL=${siteUrl}

# Bắt buộc nằm ngoài thư mục deploy, nếu không mất ảnh mỗi lần deploy lại.
MEDIA_STORAGE_DIR=/var/lib/ndthichland/media

GOOGLE_SERVICE_ACCOUNT_EMAIL=${serviceAccount.client_email}
GOOGLE_PRIVATE_KEY=${privateKeyOneLine}
GOOGLE_CMS_SPREADSHEET_ID=${sheetId}
GOOGLE_RENTAL_SPREADSHEET_ID=${sheetId}

ADMIN_EMAIL=${adminEmail}
ADMIN_PASSWORD_HASH=${adminPasswordHash}
AUTH_SECRET=${authSecret}
`;

writeFileSync(outPath, content, { mode: 0o600 });

console.log(`Đã ghi: ${outPath}`);
console.log(`  Khoá riêng: ${privateKeyOneLine.length} ký tự, trên 1 dòng (đúng dạng systemd cần)`);
console.log(`  AUTH_SECRET: ${authSecret.length} ký tự`);
console.log("");
console.log("=====================================================");
console.log("  MẬT KHẨU ADMIN MỚI (chỉ hiện đúng lần này):");
console.log(`     ${adminEmail}`);
console.log(`     ${adminPassword}`);
console.log("=====================================================");
console.log("Lưu ngay vào trình quản lý mật khẩu. Mật khẩu cũ không dùng");
console.log("được trên VPS nữa — nó đã lộ trong tài liệu PDF bàn giao.");
