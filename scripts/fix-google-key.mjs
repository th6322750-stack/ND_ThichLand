// One-time fix: push the freshly-rotated service-account key into Vercel's
// Production GOOGLE_PRIVATE_KEY. Reads straight from the downloaded JSON —
// never retype a private key by hand (a single mistyped character here has
// broken production before).
//
// Usage (PowerShell, from the repo root, logged into the correct Vercel account):
//   node scripts/fix-google-key.mjs "C:\Users\Admin\Downloads\ndthich-xxxxxxxx.json"

import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { createPrivateKey } from "node:crypto";
import { spawnSync } from "node:child_process";

const keyPath = process.argv[2];
if (!keyPath) {
  console.error("Usage: node scripts/fix-google-key.mjs <path-to-downloaded-key.json>");
  process.exit(1);
}

const key = JSON.parse(readFileSync(keyPath, "utf8"));
const { private_key: privateKey, client_email: clientEmail, private_key_id: keyId } = key;

try {
  createPrivateKey(privateKey);
} catch (e) {
  console.error("PEM does not parse — the downloaded file looks corrupted:", e.message);
  process.exit(1);
}

console.log("client_email:", clientEmail);
console.log("private_key_id:", keyId);

const collapsed = privateKey.replace(/\r?\n/g, "\\n");
const tmpFile = ".fix-google-key.tmp";
writeFileSync(tmpFile, collapsed);

console.log("\nRemoving old GOOGLE_PRIVATE_KEY from Production...");
spawnSync("vercel", ["env", "rm", "GOOGLE_PRIVATE_KEY", "production", "--yes"], {
  stdio: "inherit",
  shell: true,
});

console.log("\nAdding the new key to Production...");
const add = spawnSync("vercel", ["env", "add", "GOOGLE_PRIVATE_KEY", "production"], {
  input: collapsed,
  stdio: ["pipe", "inherit", "inherit"],
  shell: true,
});

unlinkSync(tmpFile);

if (add.status !== 0) {
  console.error("\nFAILED — vercel env add exited non-zero. The old key may now be gone; check `vercel env ls production`.");
  process.exit(1);
}

console.log("\nDone. GOOGLE_PRIVATE_KEY updated in Production.");
console.log("Next: redeploy (vercel --prod, or via the dashboard's Redeploy button) for the new key to take effect.");
