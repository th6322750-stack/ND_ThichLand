"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/server/auth/dal";
import { getMediaProviders } from "@/lib/server/media/providers";
import { validateMediaFile } from "@/lib/server/media/validate";
import type { MediaRecord } from "@/lib/server/media/repository";

export interface MediaActionResult {
  ok: boolean;
  error?: string;
  record?: MediaRecord;
}

const UNAUTHORIZED: MediaActionResult = { ok: false, error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." };

export async function uploadMediaAction(formData: FormData): Promise<MediaActionResult> {
  const session = await getSession();
  if (!session) return UNAUTHORIZED;

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
    webViewLink: `/api/media/${encodeURIComponent(id)}`,
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
