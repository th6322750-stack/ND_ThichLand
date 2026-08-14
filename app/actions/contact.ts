"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { getContactRepository } from "@/lib/server/contact/providers";
import { validateContactForm, type ContactFormInput } from "@/lib/server/contact/validate";
import { hashClientIp, isRateLimited, recordSubmission } from "@/lib/server/contact/rateLimit";
import { getRateLimitSecret } from "@/lib/server/env";
import type { ContactRecord } from "@/lib/server/contact/repository";

export interface ContactActionInput extends ContactFormInput {
  /** Honeypot — must arrive empty. A bot that fills every field trips this. */
  website: string;
}

export interface ContactActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

const GENERIC_ERROR: ContactActionResult = {
  ok: false,
  error: "Không gửi được yêu cầu. Vui lòng thử lại sau.",
};

async function resolveClientIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

export async function submitContactAction(input: ContactActionInput): Promise<ContactActionResult> {
  // Silently "succeed" for bots without ever writing a row — never reveal the honeypot exists.
  if (input.website.trim()) {
    return { ok: true };
  }

  const { errors, value } = validateContactForm(input);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: "Vui lòng kiểm tra lại thông tin.", fieldErrors: errors };
  }

  const secret = getRateLimitSecret();
  const ip = await resolveClientIp();
  const ipHash = secret ? hashClientIp(ip, secret) : "unconfigured";

  const repo = await getContactRepository();

  if (secret && (await isRateLimited(ipHash, repo))) {
    return GENERIC_ERROR;
  }

  const record: ContactRecord = {
    id: `contact:${randomUUID()}`,
    createdAt: new Date().toISOString(),
    name: value!.name,
    phone: value!.phone,
    need: value!.need,
    area: value!.area,
    message: value!.message,
    status: "new",
    ipHash,
  };

  try {
    await repo.create(record);
  } catch {
    return GENERIC_ERROR;
  }

  if (secret) recordSubmission(ipHash);

  return { ok: true };
}
