#!/usr/bin/env node
// Gác cổng gói standalone trước khi đẩy lên VPS.
//
// Có script này vì lần trước gói phình từ 53MB lên 3.1GB, nuốt cả .git và
// .env.local, mà chỉ phát hiện được nhờ tình cờ build Vercel hỏng. Kiểm bằng
// mắt qua `ls` là không đủ: sai một lần là secret của máy build nằm trên server.
//
// Dùng: node scripts/verify-bundle.mjs [đường-dẫn-gói]  (mặc định .next/standalone)
// Chạy TRƯỚC khi chép public/ vào gói (chép xong ~620MB, vượt ngưỡng).
//
// Viết bằng Node chứ không phải bash để chạy được cả trên máy dev Windows lẫn
// CI/Linux — nơi build thực sự diễn ra không cố định.
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const dir = process.argv[2] ?? ".next/standalone";
const maxMb = Number(process.env.VERIFY_BUNDLE_MAX_MB ?? 150);
const problems = [];

if (!existsSync(dir)) {
  console.error(`Không tìm thấy ${dir} — build có kèm BUILD_STANDALONE=1 chưa?`);
  process.exit(1);
}

console.log(`Kiểm tra gói: ${dir}`);

// 1. Những thứ không bao giờ được lên server.
const banned = [
  ".git", ".env", ".env.local", ".env.production", ".env.development",
  ".webby", ".vercel", ".github", "tests", "scripts", "docs",
  ".next-playwright-mock", "qa-handover-output",
];
for (const name of banned) {
  if (existsSync(path.join(dir, name))) problems.push(`${name} lọt vào gói`);
}

// 2. Quét toàn cây: file .env ở mọi độ sâu, và mã nguồn .ts/.tsx còn sót.
//    File .ts còn lại nghĩa là bộ dò đang quét cả dự án — đúng cơ chế đã kéo
//    .git và .env.local vào lần trước. Node chạy bản biên dịch ở .next/server.
const envFiles = [];
let sourceCount = 0;
let totalBytes = 0;

function walk(current) {
  let entries;
  try {
    entries = readdirSync(current, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(current, entry.name);
    const inNodeModules = full.includes(`${path.sep}node_modules${path.sep}`);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    try {
      totalBytes += statSync(full).size;
    } catch {
      /* file biến mất giữa chừng — bỏ qua */
    }
    if (inNodeModules) continue;
    if (entry.name.startsWith(".env")) envFiles.push(path.relative(dir, full));
    if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) sourceCount++;
  }
}
walk(dir);

if (envFiles.length > 0) problems.push(`còn file môi trường: ${envFiles.join(", ")}`);
if (sourceCount > 0) {
  problems.push(`${sourceCount} file mã nguồn .ts/.tsx còn trong gói (bộ dò đang quét cả cây thư mục)`);
}

// 3. Ngưỡng dung lượng — lưới an toàn cuối cho thứ chưa ai nghĩ tới.
const sizeMb = Math.round(totalBytes / 1024 / 1024);
if (sizeMb > maxMb) problems.push(`gói ${sizeMb} MB, vượt ngưỡng ${maxMb} MB`);

// 4. Phải có điểm vào, không thì gói vô dụng.
if (!existsSync(path.join(dir, "server.js"))) problems.push("thiếu server.js");

if (problems.length > 0) {
  for (const p of problems) console.error(`  CHẶN: ${p}`);
  console.error("\nGÓI KHÔNG ĐẠT — không đẩy lên server.");
  process.exit(1);
}

console.log(`  Gói sạch: ${sizeMb}MB, không secret, không mã nguồn.`);
