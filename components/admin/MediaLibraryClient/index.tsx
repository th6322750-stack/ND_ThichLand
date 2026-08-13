"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { MediaGrid } from "@/components/admin/MediaGrid";
import { uploadMediaAction, deleteMediaAction } from "@/app/actions/media";
import type { MediaRecord } from "@/lib/server/media/repository";

function toGridItem(r: MediaRecord) {
  return {
    id: r.id,
    filename: r.filename,
    src: r.webViewLink,
    kind: r.mimeType.startsWith("video/") ? ("Video" as const) : ("Ảnh" as const),
  };
}

export function MediaLibraryClient({ initialItems }: { initialItems: MediaRecord[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(undefined);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadMediaAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteMediaAction(id);
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-h1-mobile text-ink desktop:text-h1">Media Library</h2>
          <p className="mt-2 text-body text-muted">Quản lý ảnh/video cho BĐS, dự án và tin tức.</p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover disabled:opacity-60"
        >
          {uploading ? "Đang tải..." : "Tải media"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <p role="alert" className="mt-4 text-body text-error">
          {error}
        </p>
      )}

      <div className="mt-6">
        <MediaGrid items={initialItems.map(toGridItem)} onDelete={(item) => item.id && handleDelete(item.id)} />
      </div>
    </div>
  );
}
