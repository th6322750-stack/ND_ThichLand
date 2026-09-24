#!/usr/bin/env node
// Build gói standalone cho VPS rồi kiểm luôn gói trước khi ai kịp đẩy đi.
//
// Gộp hai bước vào một lệnh vì bước kiểm là thứ dễ bị bỏ qua nhất — mà nó
// chính là cái chặn secret của máy build lọt lên server.
//
// Viết bằng Node để chạy được cả trên Windows lẫn Linux: cú pháp
// `BUILD_STANDALONE=1 next build` không hợp lệ trên cmd.exe.
import { spawnSync } from "node:child_process";

function run(command, args, { extraEnv = {}, shell = false } = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell,
    env: { ...process.env, ...extraEnv },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// `next` is a .cmd shim on Windows and needs a shell; node.exe does not — and
// running it through one breaks on the space in "C:\Program Files\nodejs".
run("next", ["build"], { extraEnv: { BUILD_STANDALONE: "1" }, shell: process.platform === "win32" });
run(process.execPath, ["scripts/verify-bundle.mjs"]);

console.log("\nGói sẵn sàng ở .next/standalone");
console.log("Bước tiếp theo (xem DEPLOY_VPS.md):");
console.log("  cp -r public       .next/standalone/");
console.log("  cp -r .next/static .next/standalone/.next/");
