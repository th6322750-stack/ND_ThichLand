"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { MediaGrid } from "@/components/admin/MediaGrid";
import { PageHeader } from "@/components/admin/PageHeader";
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Thư viện ảnh"
        description="Quản lý ảnh/video cho BĐS, dự án và tin tức."
        action={
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="min-h-[44px] rounded-sm bg-primary px-6 py-3 text-button uppercase text-surface transition-[background-color,transform] duration-fast ease-base hover:bg-primaryHover active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100 motion-reduce:active:scale-100"
            >
              {uploading ? "Đang tải..." : "Tải ảnh/video"}
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
          </>
        }
      />

      {error && (
        <p role="alert" className="text-body text-error">
          {error}
        </p>
      )}

      <MediaGrid items={initialItems.map(toGridItem)} onDelete={(item) => item.id && handleDelete(item.id)} />
    </div>
  );
}
