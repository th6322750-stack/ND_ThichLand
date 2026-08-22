"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/server/auth/dal";
import { getNewsRepository } from "@/lib/server/news/providers";
import type { NewsRecord } from "@/lib/server/news/repository";
import { isGoogleRuntimeConfigured } from "@/lib/server/env";
import { resolveProviderMode, PERSISTENCE_NOT_CONFIGURED_ERROR } from "@/lib/server/providerMode";

export interface NewsFormInput {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  cover: string;
  sections: { heading: string; body: string }[];
  // readMinutes remains a derived compatibility field in the stored schema;
  // it is not submitted by the form or displayed on the public website.
}

export interface NewsActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

const UNAUTHORIZED: NewsActionResult = { ok: false, error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." };
const NOT_CONFIGURED: NewsActionResult = { ok: false, error: PERSISTENCE_NOT_CONFIGURED_ERROR };

function persistenceUnavailable(): boolean {
  return resolveProviderMode(isGoogleRuntimeConfigured()) === "unavailable";
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function validate(input: NewsFormInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.title.trim()) errors.title = "Vui lòng nhập tiêu đề";
  if (!input.category.trim()) errors.category = "Vui lòng nhập danh mục";
  const emptySection = input.sections.findIndex((s) => !s.heading.trim() && !s.body.trim());
  if (emptySection >= 0) errors.sections = `Đoạn ${emptySection + 1} đang trống — nhập nội dung hoặc xóa đoạn đó.`;
  return errors;
}

const WORDS_PER_MINUTE = 200;

/**
 * Keep the legacy storage field deterministic for existing Sheets schemas
 * even though reading time is no longer shown on the public website.
 */
function estimateReadMinutes(input: NewsFormInput): number {
  const text = [input.excerpt, ...input.sections.flatMap((s) => [s.heading, s.body])].join(" ").trim();
  if (!text) return 1;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export async function saveNewsAction(input: NewsFormInput, publish: boolean): Promise<NewsActionResult> {
  const session = await getSession();
  if (!session) return UNAUTHORIZED;
  if (persistenceUnavailable()) return NOT_CONFIGURED;

  const fieldErrors = validate(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Vui lòng kiểm tra lại thông tin.", fieldErrors };
  }

  const repo = await getNewsRepository();
  const slug = input.slug || slugify(input.title);
  if (!slug) {
    return { ok: false, error: "Vui lòng kiểm tra lại thông tin.", fieldErrors: { title: "Tiêu đề cần có ít nhất một chữ cái hoặc số" } };
  }
  const now = new Date().toISOString();
  const existing = (await repo.list()).find((r) => r.id === `custom:${slug}`);

  // Same overwrite guard as the BĐS/dự án actions — a new article whose
  // title slugifies onto an existing one must not silently replace it.
  if (!input.slug && existing) {
    return {
      ok: false,
      error: "Vui lòng kiểm tra lại thông tin.",
      fieldErrors: { title: `Đã có bài viết dùng đường dẫn "${slug}". Đổi tiêu đề khác, hoặc mở bài đó ra sửa.` },
    };
  }

  const record: NewsRecord = {
    id: `custom:${slug}`,
    slug,
    title: input.title,
    category: input.category,
    excerpt: input.excerpt,
    cover: input.cover,
    sections: input.sections,
    readMinutes: estimateReadMinutes(input),
    publishedAt: existing?.publishedAt || (publish ? now.slice(0, 10) : ""),
    published: publish,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await repo.upsert(record);

  revalidatePath("/admin/tin-tuc");
  revalidatePath("/tin-tuc");
  return { ok: true };
}

export async function deleteNewsAction(id: string): Promise<NewsActionResult> {
  const session = await getSession();
  if (!session) return UNAUTHORIZED;
  if (persistenceUnavailable()) return NOT_CONFIGURED;
  const repo = await getNewsRepository();
  await repo.softDelete(id);
  revalidatePath("/admin/tin-tuc");
  revalidatePath("/tin-tuc");
  return { ok: true };
}

export async function listAdminNewsAction(): Promise<NewsRecord[] | null> {
  const session = await getSession();
  if (!session) return null;
  const repo = await getNewsRepository();
  return repo.list();
}
