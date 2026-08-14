// No "server-only" guard — see lib/server/env.ts for why.
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
