"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/server/auth/dal";
import { getProjectRepository } from "@/lib/server/projects/providers";
import type { ProjectRecord } from "@/lib/server/projects/repository";
import type { ProjectStatus } from "@/lib/types";
import { isGoogleRuntimeConfigured } from "@/lib/server/env";
import { resolveProviderMode, PERSISTENCE_NOT_CONFIGURED_ERROR } from "@/lib/server/providerMode";

export interface ProjectFormInput {
  slug: string;
  name: string;
  location: string;
  investor: string;
  status: ProjectStatus;
  summary: string;
  amenities: string[];
  progressText: string;
  progressPercent: number;
  media: string[];
}

export interface ProjectActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

const UNAUTHORIZED: ProjectActionResult = { ok: false, error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." };
const NOT_CONFIGURED: ProjectActionResult = { ok: false, error: PERSISTENCE_NOT_CONFIGURED_ERROR };

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

function validate(input: ProjectFormInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.name.trim()) errors.name = "Vui lòng nhập tên dự án";
  if (!input.location.trim()) errors.location = "Vui lòng nhập vị trí";
  return errors;
}

export async function saveProjectAction(input: ProjectFormInput, publish: boolean): Promise<ProjectActionResult> {
  const session = await getSession();
  if (!session) return UNAUTHORIZED;
  if (persistenceUnavailable()) return NOT_CONFIGURED;

  const fieldErrors = validate(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Vui lòng kiểm tra lại thông tin.", fieldErrors };
  }

  const repo = await getProjectRepository();
  const slug = input.slug || slugify(input.name);
  const now = new Date().toISOString();
  const existing = (await repo.list()).find((r) => r.id === `custom:${slug}`);

  const record: ProjectRecord = {
    id: `custom:${slug}`,
    slug,
    name: input.name,
    location: input.location,
    investor: input.investor,
    status: input.status,
    summary: input.summary,
    amenities: input.amenities,
    progressText: input.progressText,
    progressPercent: input.progressPercent,
    media: input.media,
    published: publish,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await repo.upsert(record);

  revalidatePath("/admin/du-an");
  revalidatePath("/du-an");
  return { ok: true };
}

export async function deleteProjectAction(id: string): Promise<ProjectActionResult> {
  const session = await getSession();
  if (!session) return UNAUTHORIZED;
  if (persistenceUnavailable()) return NOT_CONFIGURED;
  const repo = await getProjectRepository();
  await repo.softDelete(id);
  revalidatePath("/admin/du-an");
  revalidatePath("/du-an");
  return { ok: true };
}

export async function listAdminProjectsAction(): Promise<ProjectRecord[] | null> {
  const session = await getSession();
  if (!session) return null;
  const repo = await getProjectRepository();
  return repo.list();
}
