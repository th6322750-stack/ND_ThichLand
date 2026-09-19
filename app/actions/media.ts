"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/server/auth/dal";
import { getMediaProviders } from "@/lib/server/media/providers";
import { validateMediaFile } from "@/lib/server/media/validate";
import type { MediaRecord } from "@/lib/server/media/repository";
import { isMediaConfigured } from "@/lib/server/env";
import { resolveProviderMode, PERSISTENCE_NOT_CONFIGURED_ERROR } from "@/lib/server/providerMode";

export interface MediaActionResult {
  ok: boolean;
  error?: string;
  record?: MediaRecord;
}

const UNAUTHORIZED: MediaActionResult = { ok: false, error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." };
const NOT_CONFIGURED: MediaActionResult = { ok: false, error: PERSISTENCE_NOT_CONFIGURED_ERROR };

function persistenceUnavailable(): boolean {
  return resolveProviderMode(isMediaConfigured()) === "unavailable";
}

export async function uploadMediaAction(formData: FormData): Promise<MediaActionResult> {
  const session = await getSession();
  if (!session) return UNAUTHORIZED;
  // GĐ6 QA reopen (defect 03): never report a successful "durable" upload
  // when only ephemeral in-process RAM would actually back it in a real
  // production runtime without Drive configured.
  if (persistenceUnavailable()) return NOT_CONFIGURED;

  // Duck-typed rather than `instanceof File` — FormData entries can cross
  // realm boundaries (e.g. a File constructed via node:buffer vs the
  // platform global) where identity-based checks unreliably fail.
  const file = formData.get("file");
  const isFileLike =
    file !== null &&
    typeof file === "object" &&
    "arrayBuffer" in file &&
    typeof (file as { arrayBuffer: unknown }).arrayBuffer === "function" &&
    "name" in file &&
    "type" in file;
  if (!isFileLike) {
    return { ok: false, error: "Không tìm thấy file để tải lên." };
  }
  const uploadedFile = file as unknown as File;

  const buffer = Buffer.from(await uploadedFile.arrayBuffer());
  const validationError = validateMediaFile({ mimeType: uploadedFile.type, sizeBytes: buffer.byteLength });
  if (validationError) return { ok: false, error: validationError };

  const { repo, blobStore } = await getMediaProviders();
  const id = `media:${randomUUID()}`;
  const stored = await blobStore.put(id, uploadedFile.name, { buffer, mimeType: uploadedFile.type });

  const record: MediaRecord = {
    id,
    driveFileId: stored.driveFileId,
    filename: uploadedFile.name,
    mimeType: uploadedFile.type,
    sizeBytes: buffer.byteLength,
    // Stores with their own CDN (Vercel Blob) hand back a public URL, and
    // using it directly saves a serverless invocation per image view. Disk-
    // and Drive-backed records have no such URL and keep the proxy route.
    webViewLink: stored.publicUrl ?? `/api/media/${encodeURIComponent(id)}`,
    uploadedBy: session.sub,
    createdAt: new Date().toISOString(),
  };
  await repo.create(record);

  revalidatePath("/admin/media");
  return { ok: true, record };
}

export async function deleteMediaAction(id: string): Promise<MediaActionResult> {
  const session = await getSession();
  if (!session) return UNAUTHORIZED;
  if (persistenceUnavailable()) return NOT_CONFIGURED;

  const { repo, blobStore } = await getMediaProviders();
  const existing = (await repo.list()).find((r) => r.id === id);
  if (existing?.driveFileId) await blobStore.remove(existing.driveFileId);
  await repo.remove(id);

  revalidatePath("/admin/media");
  return { ok: true };
}

export async function listAdminMediaAction(): Promise<MediaRecord[] | null> {
  const session = await getSession();
  if (!session) return null;
  const { repo } = await getMediaProviders();
  return repo.list();
}
