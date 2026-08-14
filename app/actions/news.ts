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
  readMinutes: number;
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
  return errors;
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
  const now = new Date().toISOString();
  const existing = (await repo.list()).find((r) => r.id === `custom:${slug}`);

  const record: NewsRecord = {
    id: `custom:${slug}`,
    slug,
    title: input.title,
    category: input.category,
    excerpt: input.excerpt,
    cover: input.cover,
    sections: input.sections,
    readMinutes: input.readMinutes,
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
