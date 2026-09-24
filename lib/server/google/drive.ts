// No "server-only" guard — see lib/server/env.ts for why.
import { google, type drive_v3 } from "googleapis";
import { Readable } from "node:stream";
import { getGoogleAuthClient } from "./auth";

let cachedClient: drive_v3.Drive | null = null;

function getClient(): drive_v3.Drive {
  if (cachedClient) return cachedClient;
  cachedClient = google.drive({ version: "v3", auth: getGoogleAuthClient() });
  return cachedClient;
}

export interface UploadedDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string | null;
}

export async function uploadFileToDrive(params: {
  folderId: string;
  filename: string;
  mimeType: string;
  data: Buffer;
}): Promise<UploadedDriveFile> {
  const client = getClient();
  const res = await client.files.create({
    requestBody: { name: params.filename, parents: [params.folderId] },
    media: { mimeType: params.mimeType, body: Readable.from(params.data) },
    fields: "id, name, mimeType, webViewLink",
  });
  if (!res.data.id || !res.data.name || !res.data.mimeType) {
    throw new Error("Drive upload did not return the expected file metadata.");
  }
  return {
    id: res.data.id,
    name: res.data.name,
    mimeType: res.data.mimeType,
    webViewLink: res.data.webViewLink,
  };
}

/** Streams file bytes server-side so the service account credential and the Drive URL never reach the browser. */
export async function getDriveFileStream(
  fileId: string,
): Promise<{ stream: NodeJS.ReadableStream; mimeType: string }> {
  const client = getClient();
  const meta = await client.files.get({ fileId, fields: "mimeType" });
  const res = await client.files.get({ fileId, alt: "media" }, { responseType: "stream" });
  return {
    stream: res.data as unknown as NodeJS.ReadableStream,
    mimeType: meta.data.mimeType ?? "application/octet-stream",
  };
}

export async function deleteDriveFile(fileId: string): Promise<void> {
  const client = getClient();
  await client.files.delete({ fileId });
}

export async function getDriveFileMetadata(fileId: string): Promise<{ id: string; mimeType: string } | null> {
  const client = getClient();
  try {
    const res = await client.files.get({ fileId, fields: "id, mimeType" });
    if (!res.data.id || !res.data.mimeType) return null;
    return { id: res.data.id, mimeType: res.data.mimeType };
  } catch {
    return null;
  }
}

export async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function listDriveFolderFiles(folderId: string): Promise<drive_v3.Schema$File[]> {
  const client = getClient();
  const res = await client.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id, name, mimeType, webViewLink, createdTime)",
  });
  return res.data.files ?? [];
}
