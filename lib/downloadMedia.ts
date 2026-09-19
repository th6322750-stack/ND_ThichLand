/**
 * Saving a photo from a listing page.
 *
 * The bytes are fetched and re-served as an object URL rather than pointed at
 * with `<a href={cdnUrl} download>`: the `download` attribute is only honoured
 * same-origin, and these URLs are usually the Vercel Blob CDN, so Safari would
 * navigate to the image instead of saving it. Fetching first also makes one
 * code path cover all three shapes a media URL can take here — a Blob CDN
 * link, the `/api/media/[id]` proxy, and the legacy signed Drive proxy.
 */

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "video/mp4": "mp4",
};

/** ASCII-only: Windows' built-in zip extractor still mangles non-ASCII entry names. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Names come from the album and the position in it. The URL is no help: a Blob
 * URL is a random UUID and the proxy URLs carry no filename at all.
 */
export function mediaFileName(albumName: string, index: number, mimeType?: string): string {
  const base = slugify(albumName) || "anh";
  const ext = (mimeType && EXT_BY_MIME[mimeType.split(";")[0]!.trim()]) || "jpg";
  return `${base}-${String(index + 1).padStart(2, "0")}.${ext}`;
}

export async function fetchMediaBlob(url: string): Promise<Blob | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.blob();
  } catch {
    return null;
  }
}

function saveBlob(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

/** Saves one photo. Returns false when the fetch failed, so the caller can say so. */
export async function downloadMediaImage(url: string, albumName: string, index: number): Promise<boolean> {
  const blob = await fetchMediaBlob(url);
  if (!blob) return false;
  saveBlob(blob, mediaFileName(albumName, index, blob.type));
  return true;
}

export interface ZipDownloadResult {
  saved: number;
  failed: number;
}

/**
 * Bundles every photo into one archive. A photo that fails to download is
 * skipped rather than failing the whole set — one dead URL in an old listing
 * shouldn't cost the visitor the other nine photos.
 */
export async function downloadMediaZip(urls: string[], albumName: string): Promise<ZipDownloadResult> {
  const blobs = await Promise.all(urls.map((url) => fetchMediaBlob(url)));
  const saved = blobs.filter((blob): blob is Blob => blob !== null);
  if (saved.length === 0) return { saved: 0, failed: urls.length };

  // Loaded on demand: the zip library is dead weight for the many visitors
  // who never press "download all".
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  saved.forEach((blob, i) => {
    zip.file(mediaFileName(albumName, i, blob.type), blob);
  });

  const archive = await zip.generateAsync({ type: "blob" });
  saveBlob(archive, `${slugify(albumName) || "anh"}.zip`);
  return { saved: saved.length, failed: urls.length - saved.length };
}
