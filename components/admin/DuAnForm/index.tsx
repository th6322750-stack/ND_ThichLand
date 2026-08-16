"use client";

import { useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FormField } from "@/components/public/FormField";
import { Icon } from "@/components/icons";
import { Uploader, type UploaderState } from "@/components/admin/Uploader";
import { saveProjectAction, type ProjectFormInput } from "@/app/actions/projects";
import { uploadMediaAction } from "@/app/actions/media";
import { PROJECT_AMENITY_CATALOG } from "@/lib/projectAmenities";
import { KNOWN_PROJECT_STATUSES } from "@/lib/projectStatus";
import type { ProjectRecord } from "@/lib/server/projects/repository";

// Same WYSIWYG approach as BdsForm — "để admin biết nội dung sẽ hiển thị ở
// đâu, đồng nhất 1:1 với giao diện web" — the inputs below are styled with
// the public /du-an/[slug] page's own literal look (same hex colors/sizes)
// instead of the admin design-token system, each sitting where its value
// renders live.
const wysiwygInput =
  "w-full border-0 border-b border-dashed border-transparent bg-transparent p-0 outline-none transition-colors hover:border-[#E4E1E0] focus:border-[#880206]";

interface DuAnFormProps {
  initial?: ProjectRecord;
}

export function DuAnForm({ initial }: DuAnFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string>();
  const [media, setMedia] = useState<string[]>(initial?.media ?? []);
  const [uploaderState, setUploaderState] = useState<UploaderState>("empty");
  const [uploadError, setUploadError] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progressPhotos, setProgressPhotos] = useState<{ label: string; image: string }[]>(initial?.progressPhotos ?? []);
  const [progressUploaderState, setProgressUploaderState] = useState<UploaderState>("empty");
  const [progressUploadError, setProgressUploadError] = useState<string>();
  const progressFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initial?.amenities ?? []);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploadError(undefined);
    setUploaderState("uploading");
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadMediaAction(formData);
        if (!result.ok || !result.record) {
          setUploadError(result.error);
          setUploaderState("error");
          return;
        }
        setMedia((prev) => [...prev, result.record!.webViewLink]);
      }
      setUploaderState("empty");
    } catch {
      setUploaderState("error");
    }
  }

  function removeMediaAt(index: number) {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleProgressFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setProgressUploadError(undefined);
    setProgressUploaderState("uploading");
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadMediaAction(formData);
        if (!result.ok || !result.record) {
          setProgressUploadError(result.error);
          setProgressUploaderState("error");
          return;
        }
        setProgressPhotos((prev) => [...prev, { label: "", image: result.record!.webViewLink }]);
      }
      setProgressUploaderState("empty");
    } catch {
      setProgressUploaderState("error");
    }
  }

  function updateProgressPhotoLabel(index: number, label: string) {
    setProgressPhotos((prev) => prev.map((p, i) => (i === index ? { ...p, label } : p)));
  }

  function removeProgressPhotoAt(index: number) {
    setProgressPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleAmenity(label: string) {
    setSelectedAmenities((prev) => (prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]));
  }

  async function save(form: HTMLFormElement, publish: boolean) {
    setSaving(publish ? "publish" : "draft");
    setError(undefined);
    setSaved(undefined);
    try {
      const data = new FormData(form);
      const get = (name: string) => String(data.get(name) ?? "").trim();
      const progressMatch = get("progress").match(/(\d+)\s*%/);

      const input: ProjectFormInput = {
        slug: initial?.slug ?? "",
        name: get("name"),
        location: get("location"),
        investor: get("investor"),
        status: get("status") || (initial?.status ?? ""),
        summary: get("summary"),
        amenities: selectedAmenities,
        progressText: get("progress"),
        progressPercent: progressMatch ? Number(progressMatch[1]) : (initial?.progressPercent ?? 0),
        media,
        progressPhotos,
      };

      const result = await saveProjectAction(input, publish);
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        setError(result.error);
        return;
      }
      setFieldErrors({});
      setSaved(publish ? "Đã lưu và đăng lên website." : "Đã lưu nháp (chưa hiện trên website).");
      router.refresh();
    } finally {
      setSaving(null);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void save(e.currentTarget, true);
  }

  // Saving used to hardcode publish=true, so there was no way to park a
  // half-finished project as a draft — and re-saving a project an operator
  // had deliberately unpublished silently pushed it back onto the website.
  function handleSaveDraft(e: MouseEvent<HTMLButtonElement>) {
    const form = e.currentTarget.closest("form");
    if (form) void save(form, false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-admin-title-mobile text-ink desktop:text-admin-title">Thêm / sửa dự án</h1>
          <p className="mt-1 text-body text-muted">
            Form bám đúng giao diện thật trên website.{" "}
            {initial ? (initial.published ? "Đang hiện trên website." : "Đang là bản nháp.") : "Dự án mới."}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving !== null}
            className="rounded-md border border-primary px-6 py-3 text-button uppercase text-primary transition-colors duration-fast ease-base hover:bg-soft disabled:opacity-60"
          >
            {saving === "draft" ? "Đang lưu..." : "Lưu nháp"}
          </button>
          <button
            type="submit"
            disabled={saving !== null}
            className="rounded-md bg-primary px-6 py-3 text-button uppercase text-surface transition-colors duration-fast ease-base hover:bg-primaryHover disabled:opacity-60"
          >
            {saving === "publish" ? "Đang lưu..." : "Lưu & đăng"}
          </button>
        </div>
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

      <div className="mt-6 flex flex-col gap-6">
        {/* This section IS the real /du-an/[slug] WEB layout — same hex
            colors/sizes as the public page, not the admin design tokens —
            so each field sits exactly where its value renders live. */}
        <section className="overflow-hidden rounded-md border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line bg-soft px-6 py-3">
            <span className="text-label text-ink">Giao diện thật trên website</span>
            <span className="rounded-full bg-success/10 px-3 py-1 text-label text-success">HIỂN THỊ WEBSITE</span>
          </div>

          <div className="p-6">
            {/* Gallery zone — same spot as Gallery2 on the real page. */}
            <div>
              <div className="grid grid-cols-2 gap-3 tablet:grid-cols-4">
                <Uploader
                  state={uploaderState}
                  errorMessage={uploadError}
                  onClick={() => fileInputRef.current?.click()}
                  onRetry={() => {
                    setUploadError(undefined);
                    setUploaderState("empty");
                  }}
                />
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
              <p className="mt-2 text-body text-muted">
                {media.length === 0
                  ? "Chưa có ảnh — đây là khu vực gallery chính trên trang chi tiết. Có thể chọn nhiều ảnh cùng lúc."
                  : "Có thể bấm ô tải ảnh nhiều lần hoặc chọn nhiều ảnh cùng lúc để thêm."}
              </p>
            </div>

            {/* Title + status + location — same row/order as WEB. */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <input
                name="name"
                placeholder="Tên dự án (VD: Sun Galaxy Complex)"
                defaultValue={initial?.name}
                aria-label="Tên dự án"
                aria-invalid={fieldErrors.name ? true : undefined}
                aria-describedby={fieldErrors.name ? "du-an-name-error" : undefined}
                className={`${wysiwygInput} w-auto flex-1 text-[20px] font-extrabold leading-tight text-[#0C0D0D] placeholder:text-[#C9C6C5]`}
              />
              <select
                name="status"
                // No pre-selected status for a brand-new project: defaulting
                // the dropdown to "Đang triển khai" would have the operator
                // publish a build status nobody actually chose.
                defaultValue={initial?.status ?? ""}
                aria-label="Trạng thái dự án"
                aria-invalid={fieldErrors.status ? true : undefined}
                aria-describedby={fieldErrors.status ? "du-an-status-error" : undefined}
                className="shrink-0 rounded-full border-0 bg-[#FBEFE3] px-3 py-1 text-[12px] font-bold text-[#C08E47] outline-none"
              >
                <option value="">— Chọn trạng thái —</option>
                {KNOWN_PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {fieldErrors.name && (
              <p id="du-an-name-error" className="mt-1 text-body text-error">
                {fieldErrors.name}
              </p>
            )}
            {fieldErrors.status && (
              <p id="du-an-status-error" className="mt-1 text-body text-error">
                {fieldErrors.status}
              </p>
            )}

            <div className="mt-2 flex items-center gap-[6px]">
              <Icon name="pin" size={15} className="shrink-0 text-[#5F5D5D]" />
              <input
                name="location"
                placeholder="Vị trí (VD: Quận 7, TP. HCM)"
                defaultValue={initial?.location}
                aria-label="Vị trí"
                aria-invalid={fieldErrors.location ? true : undefined}
                aria-describedby={fieldErrors.location ? "du-an-location-error" : undefined}
                className={`${wysiwygInput} text-[13px] text-[#5F5D5D] placeholder:text-[#C9C6C5]`}
              />
            </div>
            {fieldErrors.location && (
              <p id="du-an-location-error" className="mt-1 text-body text-error">
                {fieldErrors.location}
              </p>
            )}

            {/* Facts grid — only Chủ đầu tư has a real field; the other 3
                (Loại hình/Quy mô/Số lượng) render "Đang cập nhật" on the
                real page too — no CMS field exists for them yet, so this
                stays a static preview of that same fallback, not an input
                that would silently do nothing. */}
            <div className="mt-5 grid grid-cols-4 gap-2">
              <div className="rounded-lg border border-[#EDEBEA] p-2 text-center">
                <Icon name="building" size={20} className="mx-auto text-[#880206]" />
                <input
                  name="investor"
                  placeholder="Chủ đầu tư"
                  defaultValue={initial?.investor}
                  aria-label="Chủ đầu tư"
                  className={`${wysiwygInput} mt-1 text-center text-[11px] font-bold text-[#0C0D0D] placeholder:text-[#C9C6C5]`}
                />
                <p className="leading-tight text-[9px] text-[#5F5D5D]">Chủ đầu tư</p>
              </div>
              {["Loại hình", "Quy mô", "Số lượng"].map((label) => (
                <div key={label} className="rounded-lg border border-[#EDEBEA] p-2 text-center opacity-60">
                  <Icon name="building" size={20} className="mx-auto text-[#5F5D5D]" />
                  <p className="mt-1 leading-tight text-[11px] font-bold text-[#0C0D0D]">Đang cập nhật</p>
                  <p className="leading-tight text-[9px] text-[#5F5D5D]">{label}</p>
                </div>
              ))}
            </div>

            {/* Summary — same heading/style as "Thông tin dự án" on WEB. */}
            <div className="mt-6">
              <p className="text-[16px] font-bold text-[#0C0D0D]">Thông tin dự án</p>
              <textarea
                name="summary"
                placeholder="Nội dung tổng quan về dự án..."
                defaultValue={initial?.summary}
                rows={4}
                aria-label="Nội dung giới thiệu"
                className={`${wysiwygInput} mt-2 resize-none text-[13px] leading-relaxed text-[#3A3838] placeholder:text-[#C9C6C5]`}
              />
            </div>

            {/* Amenities — toggle chips ARE the same icon+label tile that
                renders on the real page, so selecting them already shows
                exactly what will display (no separate preview needed). */}
            <div className="mt-6">
              <p className="text-[16px] font-bold text-[#0C0D0D]">Tiện ích nổi bật</p>
              <p className="text-body text-muted">Bấm để bật/tắt — icon hiện đúng như trên trang dự án.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PROJECT_AMENITY_CATALOG.map((a) => {
                  const active = selectedAmenities.includes(a.label);
                  return (
                    <button
                      key={a.label}
                      type="button"
                      onClick={() => toggleAmenity(a.label)}
                      aria-pressed={active}
                      className={`flex w-[84px] flex-col items-center gap-1 rounded-lg border p-2 text-center transition-colors ${
                        active ? "border-[#880206] bg-[#FBEFE3]" : "border-[#EDEBEA] hover:border-[#880206]"
                      }`}
                    >
                      <Icon name={a.icon} size={20} className={active ? "text-[#880206]" : "text-[#C08E47]"} />
                      <span className={`text-[9px] font-medium leading-tight ${active ? "text-[#880206]" : "text-[#0C0D0D]"}`}>
                        {a.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tiến độ dự án zone — same 5-photo-tile grid as WEB, each tile
              editable in place (label input directly under its photo). */}
          <div className="border-t border-line px-6 py-6">
            <p className="text-[16px] font-bold text-[#0C0D0D]">Tiến độ dự án</p>
            <FormField
              label="Mô tả tiến độ hiện tại"
              name="progress"
              type="textarea"
              placeholder="VD: Đang thi công phần thân đến tầng 20, 55% hoàn thành"
              defaultValue={initial?.progressText || (initial ? `${initial.progressPercent}% hoàn thành` : undefined)}
              hint="Ghi kèm số % (VD: 55%) để cập nhật mốc tiến độ hiện tại — hiện dưới ảnh tương ứng trên WEB."
            />
            <div className="mt-4 grid grid-cols-2 gap-3 tablet:grid-cols-5">
              {progressPhotos.map((p, i) => (
                <div key={p.image + i} className="flex flex-col items-center text-center">
                  <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                    <Image src={p.image} alt={p.label || `Mốc tiến độ ${i + 1}`} fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => removeProgressPhotoAt(i)}
                      aria-label={`Xóa mốc tiến độ ${i + 1}`}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-error group-hover:opacity-100"
                    >
                      <Icon name="close" size={12} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={p.label}
                    onChange={(e) => updateProgressPhotoLabel(i, e.target.value)}
                    placeholder="VD: Khởi công dự án"
                    aria-label={`Nhãn mốc tiến độ ${i + 1}`}
                    className="mt-2 w-full border-0 border-b border-dashed border-[#E4E1E0] bg-transparent p-0 text-center text-[13px] font-semibold text-[#0C0D0D] outline-none placeholder:text-[#C9C6C5] focus:border-[#880206]"
                  />
                </div>
              ))}
              <Uploader
                state={progressUploaderState}
                errorMessage={progressUploadError}
                onClick={() => progressFileInputRef.current?.click()}
                onRetry={() => {
                  setProgressUploadError(undefined);
                  setProgressUploaderState("empty");
                }}
              />
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
            <p className="mt-2 text-body text-muted">
              Mỗi ảnh là 1 mốc tiến độ, hiện theo đúng thứ tự trên — dự án chưa có ảnh sẽ hiện &quot;Đang được cập nhật&quot; thay vì dùng ảnh của dự án khác.
            </p>
          </div>
        </section>
      </div>
    </form>
  );
}
