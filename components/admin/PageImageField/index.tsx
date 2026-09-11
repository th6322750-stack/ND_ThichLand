"use client";

import Image from "next/image";
import { useId, useRef, useState, type ChangeEvent } from "react";
import { uploadMediaAction } from "@/app/actions/media";

export function PageImageField({
  label,
  value,
  onChange,
  error,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadError(undefined);
    try {
      const form = new FormData();
      form.append("file", file);
      const result = await uploadMediaAction(form);
      if (!result.ok || !result.record) {
        setUploadError(result.error ?? "Không thể tải ảnh lên.");
        return;
      }
      onChange(result.record.webViewLink);
    } catch {
      setUploadError("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  }

  const message = uploadError ?? error;
  return (
    <div className="min-[1200px]:col-span-2">
      <p className="text-label text-ink">{label}</p>
      <div className={`mt-1 overflow-hidden rounded-md border ${message ? "border-error" : "border-line"}`}>
        {value ? (
          <div className="relative aspect-[16/7] bg-soft">
            <Image src={value} alt={`Xem trước ${label}`} fill sizes="(min-width: 1200px) 900px, 100vw" className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="flex min-h-[150px] items-center justify-center bg-soft px-6 text-center text-body text-muted">
            Chưa có ảnh — website sẽ dùng nền chuyển màu hiện tại.
          </div>
        )}
        <div className="flex flex-wrap gap-2 bg-surface p-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="min-h-[44px] rounded-sm border border-primary px-4 py-2 text-label text-primary transition-colors hover:bg-primary hover:text-surface disabled:opacity-60"
          >
            {uploading ? "Đang tải..." : value ? "Thay ảnh" : "Tải ảnh"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="min-h-[44px] rounded-sm border border-line px-4 py-2 text-label text-muted transition-colors hover:border-error hover:text-error"
            >
              Gỡ ảnh
            </button>
          )}
        </div>
      </div>
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
        tabIndex={-1}
      />
      {message ? <p role="alert" className="mt-1 text-body text-error">{message}</p> : hint ? <p className="mt-1 text-body text-muted">{hint}</p> : null}
    </div>
  );
}
