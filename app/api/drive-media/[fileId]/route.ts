import { NextResponse } from "next/server";
import { getDriveMediaProxySecret, isGoogleRuntimeConfigured } from "@/lib/server/env";
import { getDriveFileStream, streamToBuffer } from "@/lib/server/google/drive";
import { verifyDriveMediaSignature } from "@/lib/server/media/driveProxySignature";

export const dynamic = "force-dynamic";

/**
 * Serves legacy media referenced by hyperlink in the raw rental sheet (see
 * lib/server/media/legacyResolve.ts) — distinct from /api/media/[id], which
 * serves the admin-managed WEB_MEDIA catalog. These files were never
 * uploaded through our Admin and have no catalog row of their own.
 */
export async function GET(req: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const proxySecret = getDriveMediaProxySecret();
  if (!isGoogleRuntimeConfigured() || !proxySecret) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { fileId } = await params;
  const signature = new URL(req.url).searchParams.get("sig");
  if (!signature || !verifyDriveMediaSignature(fileId, signature, proxySecret)) {
    return new NextResponse("Not found", { status: 404 });
  }

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
