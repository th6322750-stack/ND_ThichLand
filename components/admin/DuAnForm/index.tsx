"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FormField } from "@/components/public/FormField";
import { Icon } from "@/components/icons";
import { saveProjectAction, type ProjectFormInput } from "@/app/actions/projects";
import { uploadMediaAction } from "@/app/actions/media";
import { PROJECT_AMENITY_CATALOG } from "@/lib/projectAmenities";
import type { ProjectRecord } from "@/lib/server/projects/repository";
import type { ProjectStatus } from "@/lib/types";

const PROJECT_STATUS_OPTIONS: ProjectStatus[] = ["Đang triển khai", "Tiêu biểu", "Đã hoàn thành"];

interface DuAnFormProps {
  initial?: ProjectRecord;
}

export function DuAnForm({ initial }: DuAnFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string>();
  const [media, setMedia] = useState<string[]>(initial?.media ?? []);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progressPhotos, setProgressPhotos] = useState<{ label: string; image: string }[]>(initial?.progressPhotos ?? []);
  const [uploadingProgress, setUploadingProgress] = useState(false);
  const progressFileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadMediaAction(formData);
        if (result.ok && result.record) {
          setMedia((prev) => [...prev, result.record!.webViewLink]);
        }
      }
    } finally {
      setUploading(false);
    }
  }

  function removeMediaAt(index: number) {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleProgressFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploadingProgress(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadMediaAction(formData);
        if (result.ok && result.record) {
          setProgressPhotos((prev) => [...prev, { label: "", image: result.record!.webViewLink }]);
        }
      }
    } finally {
      setUploadingProgress(false);
    }
  }

  function updateProgressPhotoLabel(index: number, label: string) {
    setProgressPhotos((prev) => prev.map((p, i) => (i === index ? { ...p, label } : p)));
  }

  function removeProgressPhotoAt(index: number) {
    setProgressPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(undefined);
    setSaved(undefined);
    try {
      const data = new FormData(e.currentTarget);
      const get = (name: string) => String(data.get(name) ?? "").trim();
      const progressMatch = get("progress").match(/(\d+)\s*%/);

      const input: ProjectFormInput = {
        slug: initial?.slug ?? "",
        name: get("name"),
        location: get("location"),
        investor: get("investor"),
        status: get("status") || (initial?.status ?? ""),
        summary: get("summary"),
        amenities: data.getAll("amenities").map(String),
        progressText: get("progress"),
        progressPercent: progressMatch ? Number(progressMatch[1]) : (initial?.progressPercent ?? 0),
        media,
        progressPhotos,
      };

      const result = await saveProjectAction(input, true);
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        setError(result.error);
        return;
      }
      setFieldErrors({});
      setSaved("Đã lưu dự án.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-admin-title-mobile text-ink desktop:text-admin-title">Thêm / sửa dự án</h1>
          <p className="mt-1 text-body text-muted">Các field đúng scope dự án đã khảo sát.</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : "Lưu"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-body text-error">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="mt-4 text-body text-success">
          {saved}
        </p>
      )}

      <section className="mt-6 rounded-md border border-line bg-surface p-6">
        <h2 className="text-h3 text-ink">Thông tin dự án</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 min-[1200px]:grid-cols-2">
          <FormField label="Tên dự án" name="name" required defaultValue={initial?.name} error={fieldErrors.name} />
          <FormField
            label="Vị trí"
            name="location"
            required
            defaultValue={initial?.location}
            error={fieldErrors.location}
          />
          <FormField label="Chủ đầu tư" name="investor" required defaultValue={initial?.investor} />
          <div className="flex flex-col gap-1">
            <label htmlFor="project-status" className="text-label text-ink">
              Trạng thái *
            </label>
            <select
              id="project-status"
              name="status"
              required
              defaultValue={initial?.status ?? PROJECT_STATUS_OPTIONS[0]}
              aria-invalid={!!fieldErrors.status}
              className={`rounded-md border px-4 py-3 text-body outline-none transition-colors duration-fast focus:ring-2 focus:ring-primary ${
                fieldErrors.status ? "border-error" : "border-line focus:border-primary"
              }`}
            >
              {PROJECT_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {fieldErrors.status && (
              <span role="alert" className="text-body text-error">
                {fieldErrors.status}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6">
          <FormField
            label="Nội dung giới thiệu"
            name="summary"
            type="textarea"
            placeholder="Nội dung tổng quan..."
            defaultValue={initial?.summary}
          />
        </div>
        <div className="mt-6">
          <span className="text-label text-ink">Tiện ích nổi bật</span>
          <p className="mt-1 text-body text-muted">Chọn tiện ích sẽ hiển thị trên trang dự án — mỗi tiện ích luôn đi kèm đúng icon tương ứng.</p>
          <div className="mt-2 grid grid-cols-2 gap-2 tablet:grid-cols-3">
            {PROJECT_AMENITY_CATALOG.map((a) => (
              <label
                key={a.label}
                className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-body text-ink hover:border-primary"
              >
                <input
                  type="checkbox"
                  name="amenities"
                  value={a.label}
                  defaultChecked={initial?.amenities.includes(a.label)}
                  className="h-4 w-4 accent-primary"
                />
                <Icon name={a.icon} size={16} className="shrink-0 text-primary" />
                {a.label}
              </label>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <FormField
            label="Tiến độ"
            name="progress"
            type="textarea"
            placeholder="Nội dung tiến độ..."
            defaultValue={initial?.progressText || (initial ? `${initial.progressPercent}% hoàn thành` : undefined)}
          />
        </div>

        <div className="mt-6">
          <span className="text-label text-ink">Ảnh tiến độ dự án</span>
          <p className="mt-1 text-body text-muted">
            Mỗi ảnh là 1 mốc tiến độ (VD: Khởi công, Cất nóc, Bàn giao) — hiện theo đúng thứ tự bên dưới trên trang dự án.
          </p>
          <div className="mt-2 flex flex-col gap-3">
            {progressPhotos.map((p, i) => (
              <div key={p.image + i} className="flex items-center gap-3 rounded-md border border-line p-2">
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md">
                  <Image src={p.image} alt={p.label || `Mốc tiến độ ${i + 1}`} fill className="object-cover" unoptimized />
                </div>
                <input
                  type="text"
                  value={p.label}
                  onChange={(e) => updateProgressPhotoLabel(i, e.target.value)}
                  placeholder="VD: Khởi công dự án"
                  aria-label={`Nhãn mốc tiến độ ${i + 1}`}
                  className="flex-1 rounded-md border border-line px-3 py-2 text-body text-ink outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => removeProgressPhotoAt(i)}
                  aria-label={`Xóa mốc tiến độ ${i + 1}`}
                  className="shrink-0 rounded-md border border-error px-3 py-2 text-label text-error hover:bg-[#FDF1F1]"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => progressFileInputRef.current?.click()}
            disabled={uploadingProgress}
            className="mt-3 flex w-full items-center gap-2 rounded-md border-2 border-dashed border-line p-6 text-label text-primary hover:border-primary disabled:opacity-60"
          >
            <Icon name="upload" size={18} /> {uploadingProgress ? "Đang tải..." : "Thêm ảnh mốc tiến độ"}
          </button>
          <input
            ref={progressFileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
            onChange={handleProgressFileChange}
          />
        </div>

        <div className="mt-6">
          <span className="text-label text-ink">Album ảnh</span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-2 flex w-full items-center gap-2 rounded-md border-2 border-dashed border-line p-6 text-label text-primary hover:border-primary disabled:opacity-60"
          >
            <Icon name="upload" size={18} /> {uploading ? "Đang tải..." : "Tải / chọn media"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
            onChange={handleFileChange}
          />
          {media.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4 tablet:grid-cols-4">
              {media.map((src, i) => (
                <div key={src + i} className="group relative aspect-[4/3] overflow-hidden rounded-md">
                  <Image src={src} alt={`Ảnh ${i + 1}`} fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => removeMediaAt(i)}
                    aria-label={`Xóa ảnh ${i + 1}`}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-error group-hover:opacity-100"
                  >
                    <Icon name="close" size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </form>
  );
}
