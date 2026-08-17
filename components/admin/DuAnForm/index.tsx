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
  const [unitTypes, setUnitTypes] = useState<
    { name: string; count: number; areaRange: string; frontage: string; image: string; caption: string }[]
  >(initial?.unitTypes ?? []);
  const [unitTypeUploadRow, setUnitTypeUploadRow] = useState<number | null>(null);
  const [unitTypeUploadError, setUnitTypeUploadError] = useState<string>();
  const unitTypeFileInputRef = useRef<HTMLInputElement>(null);
  const unitTypeUploadTargetRef = useRef<number | null>(null);
  const [highlights, setHighlights] = useState<string[]>(initial?.highlights ?? []);

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

  function addUnitTypeRow() {
    setUnitTypes((prev) => [...prev, { name: "", count: 0, areaRange: "", frontage: "", image: "", caption: "" }]);
  }

  function removeUnitTypeRow(index: number) {
    setUnitTypes((prev) => prev.filter((_, i) => i !== index));
  }

  function updateUnitTypeText(index: number, field: "name" | "areaRange" | "frontage" | "caption", value: string) {
    setUnitTypes((prev) => prev.map((u, i) => (i === index ? { ...u, [field]: value } : u)));
  }

  function updateUnitTypeCount(index: number, value: string) {
    const count = Math.max(0, Math.round(Number(value)));
    setUnitTypes((prev) => prev.map((u, i) => (i === index ? { ...u, count: Number.isFinite(count) ? count : 0 } : u)));
  }

  function triggerUnitTypeImageUpload(index: number) {
    unitTypeUploadTargetRef.current = index;
    setUnitTypeUploadError(undefined);
    unitTypeFileInputRef.current?.click();
  }

  async function handleUnitTypeFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    const index = unitTypeUploadTargetRef.current;
    if (!file || index === null) return;
    setUnitTypeUploadRow(index);
    setUnitTypeUploadError(undefined);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadMediaAction(formData);
      if (!result.ok || !result.record) {
        setUnitTypeUploadError(result.error);
        return;
      }
      const url = result.record.webViewLink;
      setUnitTypes((prev) => prev.map((u, i) => (i === index ? { ...u, image: url } : u)));
    } finally {
      setUnitTypeUploadRow(null);
    }
  }

  function removeUnitTypeImage(index: number) {
    setUnitTypes((prev) => prev.map((u, i) => (i === index ? { ...u, image: "" } : u)));
  }

  function addHighlight() {
    setHighlights((prev) => [...prev, ""]);
  }

  function updateHighlight(index: number, value: string) {
    setHighlights((prev) => prev.map((h, i) => (i === index ? value : h)));
  }

  function removeHighlight(index: number) {
    setHighlights((prev) => prev.filter((_, i) => i !== index));
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
        unitTypes,
        propertyType: get("propertyType"),
        scale: get("scale"),
        unitCount: get("unitCount"),
        highlights,
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

            {/* Facts grid — same 4 tiles as the real page (icon + value +
                label). All 4 are now real editable fields; an empty one
                still renders "Đang cập nhật" on the public page (never a
                fabricated default). */}
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
              <div className="rounded-lg border border-[#EDEBEA] p-2 text-center">
                <Icon name="building" size={20} className="mx-auto text-[#880206]" />
                <input
                  name="propertyType"
                  placeholder="Đang cập nhật"
                  defaultValue={initial?.propertyType}
                  aria-label="Loại hình"
                  className={`${wysiwygInput} mt-1 text-center text-[11px] font-bold text-[#0C0D0D] placeholder:text-[#C9C6C5]`}
                />
                <p className="leading-tight text-[9px] text-[#5F5D5D]">Loại hình</p>
              </div>
              <div className="rounded-lg border border-[#EDEBEA] p-2 text-center">
                <Icon name="building" size={20} className="mx-auto text-[#880206]" />
                <input
                  name="scale"
                  placeholder="Đang cập nhật"
                  defaultValue={initial?.scale}
                  aria-label="Quy mô"
                  className={`${wysiwygInput} mt-1 text-center text-[11px] font-bold text-[#0C0D0D] placeholder:text-[#C9C6C5]`}
                />
                <p className="leading-tight text-[9px] text-[#5F5D5D]">Quy mô</p>
              </div>
              <div className="rounded-lg border border-[#EDEBEA] p-2 text-center">
                <Icon name="building" size={20} className="mx-auto text-[#880206]" />
                <input
                  name="unitCount"
                  placeholder="Đang cập nhật"
                  defaultValue={initial?.unitCount}
                  aria-label="Số lượng"
                  className={`${wysiwygInput} mt-1 text-center text-[11px] font-bold text-[#0C0D0D] placeholder:text-[#C9C6C5]`}
                />
                <p className="leading-tight text-[9px] text-[#5F5D5D]">Số lượng</p>
              </div>
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

          {/* Điểm nổi bật zone — bullet-point USPs, same "Xem thêm" panel as
              Quy hoạch - Mặt bằng, one level above it. */}
          <div className="border-t border-line px-6 py-6">
            <p className="text-[16px] font-bold text-[#0C0D0D]">Điểm nổi bật</p>
            <p className="text-body text-muted">
              Mỗi dòng là 1 điểm nổi bật — để trống sẽ ẩn cả mục này trên trang dự án.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={h}
                    onChange={(e) => updateHighlight(i, e.target.value)}
                    placeholder="VD: Vận hành bởi Accor với hai thương hiệu Sofitel & Swissôtel"
                    aria-label={`Điểm nổi bật ${i + 1}`}
                    className="flex-1 rounded-md border border-line px-3 py-2 text-body outline-none transition-colors duration-fast focus:border-primary focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => removeHighlight(i)}
                    aria-label={`Xóa điểm nổi bật ${i + 1}`}
                    className="rounded-md border border-line p-2 text-muted transition-colors hover:border-error hover:text-error"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addHighlight}
              className="mt-3 rounded-md border border-dashed border-line px-4 py-2 text-label text-muted transition-colors hover:border-primary hover:text-primary"
            >
              + Thêm điểm nổi bật
            </button>
          </div>

          {/* Quy hoạch - Mặt bằng zone — per-unit-type breakdown, shown in
              the "Xem thêm" panel on WEB. Placed after Điểm nổi bật to match
              the WEB rendering order there. Optional: an empty list here
              hides that whole panel on the public page instead of showing a
              fabricated or blank-looking table. */}
          <div className="border-t border-line px-6 py-6">
            <p className="text-[16px] font-bold text-[#0C0D0D]">Quy hoạch - Mặt bằng (phân loại đơn vị)</p>
            <p className="text-body text-muted">
              Nhập khi có dữ liệu thật — để trống sẽ ẩn cả bảng này trên trang dự án, không hiện bảng rỗng.
            </p>
            <input
              ref={unitTypeFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
              onChange={handleUnitTypeFileChange}
            />
            <div className="mt-4 flex flex-col gap-4">
              {unitTypes.map((u, i) => (
                <div key={i} className="flex flex-col gap-3 rounded-md border border-line p-3 tablet:flex-row">
                  <div className="shrink-0">
                    {u.image ? (
                      <div className="group relative aspect-square w-24 overflow-hidden rounded-md">
                        <Image src={u.image} alt={u.name || `Loại hình ${i + 1}`} fill className="object-cover" unoptimized />
                        <button
                          type="button"
                          onClick={() => removeUnitTypeImage(i)}
                          aria-label={`Xóa ảnh loại hình ${i + 1}`}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-error group-hover:opacity-100"
                        >
                          <Icon name="close" size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24">
                        <Uploader
                          state={unitTypeUploadRow === i ? "uploading" : "empty"}
                          errorMessage={unitTypeUploadRow === null ? unitTypeUploadError : undefined}
                          onClick={() => triggerUnitTypeImageUpload(i)}
                          onRetry={() => triggerUnitTypeImageUpload(i)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="grid flex-1 grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                      <span className="text-label text-ink">Tên loại hình</span>
                      <input
                        type="text"
                        value={u.name}
                        onChange={(e) => updateUnitTypeText(i, "name", e.target.value)}
                        placeholder="VD: Nhà liền kề"
                        aria-label={`Tên loại hình ${i + 1}`}
                        className="rounded-md border border-line px-3 py-2 text-body outline-none transition-colors duration-fast focus:border-primary focus:ring-2 focus:ring-primary"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-label text-ink">Số căn</span>
                      <input
                        type="number"
                        min={0}
                        value={u.count || ""}
                        onChange={(e) => updateUnitTypeCount(i, e.target.value)}
                        placeholder="VD: 65"
                        aria-label={`Số căn loại hình ${i + 1}`}
                        className="rounded-md border border-line px-3 py-2 text-body outline-none transition-colors duration-fast focus:border-primary focus:ring-2 focus:ring-primary"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-label text-ink">Diện tích</span>
                      <input
                        type="text"
                        value={u.areaRange}
                        onChange={(e) => updateUnitTypeText(i, "areaRange", e.target.value)}
                        placeholder="VD: 105m² - 192m²"
                        aria-label={`Diện tích loại hình ${i + 1}`}
                        className="rounded-md border border-line px-3 py-2 text-body outline-none transition-colors duration-fast focus:border-primary focus:ring-2 focus:ring-primary"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-label text-ink">Mặt tiền</span>
                      <input
                        type="text"
                        value={u.frontage}
                        onChange={(e) => updateUnitTypeText(i, "frontage", e.target.value)}
                        placeholder="VD: 6m (bỏ trống nếu không áp dụng)"
                        aria-label={`Mặt tiền loại hình ${i + 1}`}
                        className="rounded-md border border-line px-3 py-2 text-body outline-none transition-colors duration-fast focus:border-primary focus:ring-2 focus:ring-primary"
                      />
                    </label>
                    <label className="col-span-2 flex flex-col gap-1">
                      <span className="text-label text-ink">Mô tả ảnh (hiện dưới ảnh trên trang dự án)</span>
                      <input
                        type="text"
                        value={u.caption}
                        onChange={(e) => updateUnitTypeText(i, "caption", e.target.value)}
                        placeholder="VD: Nhà liền kề/shophouse"
                        aria-label={`Mô tả ảnh loại hình ${i + 1}`}
                        className="rounded-md border border-line px-3 py-2 text-body outline-none transition-colors duration-fast focus:border-primary focus:ring-2 focus:ring-primary"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeUnitTypeRow(i)}
                    aria-label={`Xóa loại hình ${i + 1}`}
                    className="self-start rounded-md border border-line p-2 text-muted transition-colors hover:border-error hover:text-error"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addUnitTypeRow}
              className="mt-3 rounded-md border border-dashed border-line px-4 py-2 text-label text-muted transition-colors hover:border-primary hover:text-primary"
            >
              + Thêm loại hình
            </button>
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
