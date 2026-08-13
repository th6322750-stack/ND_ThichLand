// No "server-only" guard — see lib/server/env.ts for why.
import { isGoogleRuntimeConfigured } from "@/lib/server/env";
import { getDriveFileMetadata, listDriveFolderFiles } from "@/lib/server/google/drive";

export const MEDIA_PLACEHOLDER = "/assets/placeholders/property-placeholder.svg";

export interface LegacyMediaResolution {
  media: string[];
  diagnostic?: string;
}

const DRIVE_FILE_RE = /drive\.google\.com\/file\/d\/([\w-]+)/;
const DRIVE_OPEN_ID_RE = /[?&]id=([\w-]+)/;
const DRIVE_FOLDER_RE = /drive\.google\.com\/drive\/folders\/([\w-]+)/;
const PHOTOS_RE = /photos\.(app\.goo\.gl|google\.com)/;
const IMAGE_MIME_PREFIX = "image/";

function placeholder(diagnostic: string): LegacyMediaResolution {
  return { media: [MEDIA_PLACEHOLDER], diagnostic };
}

// Per-process memoization — the raw sheet has ~1,100 rows and this function
// is called on every merge; without this, every request re-hits the Drive
// API per row. This still means a cold first pass resolves sequentially
// (see buildMergedRentalData) — acceptable for review, but worth revisiting
// (batch pre-resolve / persistent cache) before real production traffic.
const cache = new Map<string, Promise<LegacyMediaResolution>>();

async function resolveUncached(trimmed: string): Promise<LegacyMediaResolution> {
  if (PHOTOS_RE.test(trimmed)) {
    return placeholder(`Google Photos album link — không thể resolve tự động, giữ placeholder (nguồn: ${trimmed}).`);
  }

  const folderMatch = trimmed.match(DRIVE_FOLDER_RE);
  const fileMatch = trimmed.match(DRIVE_FILE_RE) ?? trimmed.match(DRIVE_OPEN_ID_RE);

  if (!folderMatch && !fileMatch) {
    return placeholder(`Không nhận diện được định dạng link media: ${trimmed}`);
  }

  if (!isGoogleRuntimeConfigured()) {
    return placeholder("Google Drive chưa cấu hình runtime — giữ placeholder.");
  }

  try {
    if (folderMatch) {
      const files = await listDriveFolderFiles(folderMatch[1]);
      const images = files.filter((f): f is typeof f & { id: string } => Boolean(f.id) && Boolean(f.mimeType?.startsWith(IMAGE_MIME_PREFIX)));
      if (images.length === 0) {
        return placeholder(`Thư mục Drive không có ảnh truy cập được: ${folderMatch[1]}`);
      }
      return { media: images.map((f) => `/api/drive-media/${f.id}`) };
    }

    const fileId = fileMatch![1];
    const meta = await getDriveFileMetadata(fileId);
    if (!meta || !meta.mimeType.startsWith(IMAGE_MIME_PREFIX)) {
      return placeholder(`Không truy cập được file Drive: ${fileId}`);
    }
    return { media: [`/api/drive-media/${fileId}`] };
  } catch {
    return placeholder(`Lỗi truy cập Drive cho link media: ${trimmed}`);
  }
}

export async function resolveLegacyMediaLink(link: string): Promise<LegacyMediaResolution> {
  const trimmed = link.trim();
  if (!trimmed) return { media: [] };

  const cached = cache.get(trimmed);
  if (cached) return cached;

  const promise = resolveUncached(trimmed);
  cache.set(trimmed, promise);
  return promise;
}
