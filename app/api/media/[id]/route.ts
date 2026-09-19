import { NextResponse } from "next/server";
import { getMediaProviders } from "@/lib/server/media/providers";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { repo, blobStore } = await getMediaProviders();

  const record = (await repo.list()).find((r) => r.id === decodeURIComponent(id));
  if (!record || !record.driveFileId) {
    return new NextResponse("Not found", { status: 404 });
  }

  const blob = await blobStore.get(record.driveFileId);
  if (!blob) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(blob.buffer), {
    headers: {
      "Content-Type": blob.mimeType,
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
