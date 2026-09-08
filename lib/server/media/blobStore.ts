// No "server-only" guard — see lib/server/env.ts for why.
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { uploadFileToDrive, getDriveFileStream, deleteDriveFile, streamToBuffer } from "@/lib/server/google/drive";
import { requireGoogleMediaFolderId } from "@/lib/server/env";

export interface MediaBlob {
  buffer: Buffer;
  mimeType: string;
}

export interface MediaBlobStore {
  /** Note: the Drive `webViewLink` a caller might expect here is a Drive UI page, not raw bytes — always
   * serve media through our own `/api/media/{id}` proxy (see app/api/media/[id]/route.ts), never that link. */
  put(id: string, filename: string, blob: MediaBlob): Promise<{ driveFileId: string }>;
  get(driveFileId: string): Promise<MediaBlob | null>;
  remove(driveFileId: string): Promise<void>;
}

export class GoogleDriveBlobStore implements MediaBlobStore {
  async put(_id: string, filename: string, blob: MediaBlob): Promise<{ driveFileId: string }> {
    const folderId = requireGoogleMediaFolderId();
    const uploaded = await uploadFileToDrive({ folderId, filename, mimeType: blob.mimeType, data: blob.buffer });
    return { driveFileId: uploaded.id };
  }

  async get(driveFileId: string): Promise<MediaBlob | null> {
    try {
      const { stream, mimeType } = await getDriveFileStream(driveFileId);
      const buffer = await streamToBuffer(stream);
      return { buffer, mimeType };
    } catch {
      return null;
    }
  }

  async remove(driveFileId: string): Promise<void> {
    await deleteDriveFile(driveFileId);
  }
}

// Extension <-> MIME for exactly the types validateMediaFile accepts. The
// stored filename carries the extension, so get() can answer with a real
// Content-Type without a sidecar file or a second lookup in the sheet.
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "application/pdf": "pdf",
};
const EXT_TO_MIME: Record<string, string> = Object.fromEntries(
  Object.entries(MIME_TO_EXT).map(([mime, ext]) => [ext, mime]),
);

/** Stored names are generated here, never taken from caller input, and every
 * read re-validates the shape before touching the filesystem — `driveFileId`
 * round-trips through the CMS spreadsheet, which an operator can edit by
 * hand, so it must never be trusted as a path. */
const STORED_NAME = /^[0-9a-f-]{36}\.[a-z0-9]{2,5}$/;

/**
 * Disk-backed store for the VPS deployment. Google service accounts have no
 * Drive storage quota of their own, so GoogleDriveBlobStore can only write
 * into a Shared Drive (Workspace-only) — uploading into a personal Drive
 * folder fails with 403 "Service Accounts do not have storage quota". On a
 * VPS the app has a real disk, so the bytes live there and only the metadata
 * row stays in Sheets.
 */
export class LocalDiskBlobStore implements MediaBlobStore {
  constructor(private readonly dir: string) {}

  async put(_id: string, _filename: string, blob: MediaBlob): Promise<{ driveFileId: string }> {
    const ext = MIME_TO_EXT[blob.mimeType];
    if (!ext) throw new Error(`Unsupported media type for disk storage: ${blob.mimeType}`);
    const storedName = `${randomUUID()}.${ext}`;
    await fs.mkdir(this.dir, { recursive: true });
    await fs.writeFile(path.join(this.dir, storedName), blob.buffer);
    return { driveFileId: storedName };
  }

  async get(driveFileId: string): Promise<MediaBlob | null> {
    if (!STORED_NAME.test(driveFileId)) return null;
    const ext = driveFileId.split(".").pop()!;
    const mimeType = EXT_TO_MIME[ext];
    if (!mimeType) return null;
    try {
      const buffer = await fs.readFile(path.join(this.dir, driveFileId));
      return { buffer, mimeType };
    } catch {
      return null;
    }
  }

  async remove(driveFileId: string): Promise<void> {
    if (!STORED_NAME.test(driveFileId)) return;
    await fs.unlink(path.join(this.dir, driveFileId)).catch(() => {});
  }
}

export class InMemoryBlobStore implements MediaBlobStore {
  private readonly blobs = new Map<string, MediaBlob>();

  async put(id: string, _filename: string, blob: MediaBlob): Promise<{ driveFileId: string }> {
    this.blobs.set(id, blob);
    return { driveFileId: id };
  }

  async get(driveFileId: string): Promise<MediaBlob | null> {
    return this.blobs.get(driveFileId) ?? null;
  }

  async remove(driveFileId: string): Promise<void> {
    this.blobs.delete(driveFileId);
  }
}
