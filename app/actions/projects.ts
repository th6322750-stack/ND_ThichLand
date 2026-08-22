"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/server/auth/dal";
import { getProjectRepository } from "@/lib/server/projects/providers";
import type { ProjectRecord } from "@/lib/server/projects/repository";
import type { ProjectStatus } from "@/lib/types";
import { parseProjectStatus } from "@/lib/projectStatus";
import { isGoogleRuntimeConfigured } from "@/lib/server/env";
import { resolveProviderMode, PERSISTENCE_NOT_CONFIGURED_ERROR } from "@/lib/server/providerMode";

export interface ProjectFormInput {
  slug: string;
  name: string;
  location: string;
  /** Precise address/place/"lat, lng" the map pin geocodes to. Empty hides the map section. */
  mapQuery: string;
  /** The project's own masterplan drawing. Empty = none uploaded. */
  masterplanImage: string;
  /** Whether the "Mặt bằng dự án" section renders at all. */
  showMasterplan: boolean;
  investor: string;
  // Raw typed text, not ProjectStatus — validate() below is the only place
  // that turns this into the validated union value (same never-fabricate
  // pattern as BdsFormInput.propertyType/availability in app/actions/bds.ts).
  status: string;
  summary: string;
  amenities: string[];
  progressText: string;
  progressPercent: number;
  media: string[];
  progressPhotos: { label: string; image: string }[];
  unitTypes: { name: string; count: number; areaRange: string; frontage: string; image: string; caption: string }[];
  propertyType: string;
  scale: string;
  unitCount: string;
  highlights: string[];
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

function validate(input: ProjectFormInput, status: ProjectStatus | null): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.name.trim()) errors.name = "Vui lòng nhập tên dự án";
  if (!input.location.trim()) errors.location = "Vui lòng nhập vị trí";
  if (!status) errors.status = "Trạng thái không hợp lệ";
  return errors;
}

export async function saveProjectAction(input: ProjectFormInput, publish: boolean): Promise<ProjectActionResult> {
  const session = await getSession();
  if (!session) return UNAUTHORIZED;
  if (persistenceUnavailable()) return NOT_CONFIGURED;

  const status = parseProjectStatus(input.status);
  const fieldErrors = validate(input, status);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Vui lòng kiểm tra lại thông tin.", fieldErrors };
  }

  const repo = await getProjectRepository();
  const slug = input.slug || slugify(input.name);
  if (!slug) {
    return { ok: false, error: "Vui lòng kiểm tra lại thông tin.", fieldErrors: { name: "Tên dự án cần có ít nhất một chữ cái hoặc số" } };
  }
  const now = new Date().toISOString();
  const existing = (await repo.list()).find((r) => r.id === `custom:${slug}`);

  // Creating (no slug carried in from an edit form) onto an id that already
  // exists used to silently overwrite the other project — a real data-loss
  // path any time two projects share a name. Refuse instead and tell the
  // operator what to do.
  if (!input.slug && existing) {
    return {
      ok: false,
      error: "Vui lòng kiểm tra lại thông tin.",
      fieldErrors: { name: `Đã có dự án dùng đường dẫn "${slug}". Đổi tên khác, hoặc mở dự án đó ra sửa.` },
    };
  }

  const record: ProjectRecord = {
    id: `custom:${slug}`,
    slug,
    name: input.name,
    location: input.location,
    mapQuery: input.mapQuery.trim(),
    masterplanImage: input.masterplanImage.trim(),
    showMasterplan: input.showMasterplan,
    investor: input.investor,
    // Non-null: validate() above already rejected a null status before
    // this point is reached.
    status: status!,
    summary: input.summary,
    amenities: input.amenities,
    progressText: input.progressText,
    progressPercent: Math.min(100, Math.max(0, Math.round(Number(input.progressPercent) || 0))),
    media: input.media,
    progressPhotos: input.progressPhotos,
    // Drop a row an admin started (typed a name) but never actually
    // attached a count to — an entry with count 0/NaN would otherwise
    // render "0 căn" as if that were a real fact about the project.
    unitTypes: input.unitTypes.filter((u) => u.name.trim() && u.count > 0),
    propertyType: input.propertyType,
    scale: input.scale,
    unitCount: input.unitCount,
    // Drop blank lines an admin left empty when adding/removing rows.
    highlights: input.highlights.map((h) => h.trim()).filter(Boolean),
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
