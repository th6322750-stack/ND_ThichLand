#!/usr/bin/env node
// Generates an ADMIN_PASSWORD_HASH value in the exact format
// lib/server/crypto/passwords.ts expects: scrypt:N:r:p:saltHex:hashHex
//
// Usage:
//   node scripts/hash-password.mjs "your-real-password"
//   node scripts/hash-password.mjs            (prompts on stdin)
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import readline from "node:readline";

const scrypt = promisify(scryptCallback);

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, KEY_LENGTH, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
  return `scrypt:${SCRYPT_N}:${SCRYPT_R}:${SCRYPT_P}:${salt.toString("hex")}:${derived.toString("hex")}`;
}

async function readPasswordFromStdin() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question("Password to hash (visible while typing): ", (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

const argPassword = process.argv[2];
const password = argPassword ?? (await readPasswordFromStdin());

if (!password) {
  console.error("No password provided.");
  process.exit(1);
}

const hash = await hashPassword(password);
console.log("\nADMIN_PASSWORD_HASH=" + hash + "\n");
console.log("Paste the line above into your production env store. Never commit it to git.");
