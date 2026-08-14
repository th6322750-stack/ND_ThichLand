import { NextResponse } from "next/server";
import { isGoogleRuntimeConfigured } from "@/lib/server/env";
import { getDriveFileStream, streamToBuffer } from "@/lib/server/google/drive";

export const dynamic = "force-dynamic";

/**
 * Serves legacy media referenced by hyperlink in the raw rental sheet (see
 * lib/server/media/legacyResolve.ts) — distinct from /api/media/[id], which
 * serves the admin-managed WEB_MEDIA catalog. These files were never
 * uploaded through our Admin and have no catalog row of their own.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ fileId: string }> }) {
  if (!isGoogleRuntimeConfigured()) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { fileId } = await params;
  try {
    const { stream, mimeType } = await getDriveFileStream(fileId);
    const buffer = await streamToBuffer(stream);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
