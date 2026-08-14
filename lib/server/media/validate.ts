const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export function validateMediaFile(file: { mimeType: string; sizeBytes: number }): string | null {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimeType);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimeType);
  if (!isImage && !isVideo) {
    return "Định dạng file không được hỗ trợ. Chỉ nhận ảnh (JPEG/PNG/WebP/GIF) hoặc video MP4/WebM.";
  }
  const max = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.sizeBytes > max) {
    return isVideo ? "Video vượt quá dung lượng cho phép (50MB)." : "Ảnh vượt quá dung lượng cho phép (8MB).";
  }
  if (file.sizeBytes <= 0) {
    return "File rỗng hoặc không đọc được dung lượng.";
  }
  return null;
}
