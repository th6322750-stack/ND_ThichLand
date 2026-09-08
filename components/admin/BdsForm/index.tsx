"use client";

import { useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FormField } from "@/components/public/FormField";
import { FormSection } from "@/components/admin/FormSection";
import { Uploader, type UploaderState } from "@/components/admin/Uploader";
import { Icon2 } from "@/components/public-v2/Icon2";
import { saveBdsAction, type BdsFormInput } from "@/app/actions/bds";
import { uploadMediaAction } from "@/app/actions/media";
import { formatArea, formatCurrencyVnd } from "@/lib/format";
import type { AdminPropertyRecord, Availability, PropertyType } from "@/lib/types";
import { moveItem } from "@/lib/admin/mediaOrder";
import { useScrollToFirstError } from "@/lib/useScrollToFirstError";

// Mirrors the closed sets app/actions/bds.ts validates against.
const PROPERTY_TYPE_OPTIONS: PropertyType[] = ["Căn hộ", "Nhà", "Mặt bằng", "Văn phòng", "Xưởng", "Studio"];
const AVAILABILITY_OPTIONS: Availability[] = ["Còn trống", "Đã cho thuê", "Sắp trống"];

// Client asked for this section to BE the real /cho-thue/[slug] page layout
// (not a separate preview panel next to a plain form) — "để admin biết nội
// dung sẽ hiển thị ở đâu, đồng nhất 1:1 với giao diện web". So the inputs
// below are styled with the public site's own literal look (Be Vietnam
// Pro, #880206/#0C0D0D/#5F5D5D/#EDEBEA, the same sizes as the real page)
// instead of the admin design-token system — each one sits exactly where
// its value renders on the live page, editable in place.
const wysiwygInput =
  "w-full border-0 border-b border-dashed border-transparent bg-transparent p-0 outline-none transition-colors hover:border-[#E4E1E0] focus:border-[#880206]";

interface BdsFormProps {
  initial?: AdminPropertyRecord;
}

/** Empty -> null ("chưa biết"); a non-numeric or negative entry is also null
    rather than persisting NaN into the sheet. */
function parseCount(raw: string): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}

function readInput(form: HTMLFormElement, initial: AdminPropertyRecord | undefined, media: string[]): BdsFormInput {
  const data = new FormData(form);
  const get = (name: string) => String(data.get(name) ?? "").trim();

  return {
    slug: initial?.slug ?? "",
    sourceId: initial?.sourceId,
    roomNo: get("roomNo"),
    location: get("location"),
    address: get("address"),
    priceRaw: get("price"),
    serviceFee: get("serviceFee"),
    areaRaw: get("area"),
    verticalAccess: get("verticalAccess"),
    // GĐ6 QA reopen (defect 01): never default an empty/untouched field to
    // a plausible-looking guess ("Nhà"/"Còn trống") — pass through the
    // existing value unchanged (edit) or empty (new record, server-side
    // validation in app/actions/bds.ts will reject it with a field error).
    propertyType: get("propertyType") || (initial?.propertyType ?? ""),
    description: get("description"),
    highlights: get("highlights")
      .split("•")
      .map((h) => h.trim())
      .filter(Boolean),
    availability: get("availability") || (initial?.availability ?? ""),
    // Empty input -> null ("unknown"), never a fabricated 0/"" — an admin
    // clearing the field is a deliberate "no data" the same way a
    // sheet-derived record starts null until explicitly set.
    bedroomCount: parseCount(get("bedroomCount")),
    bathroomCount: parseCount(get("bathroomCount")),
    furnishingStatus: get("furnishingStatus") || null,
    // Backs the Tiện ích/Vị trí/Video tabs — same empty-input -> null/[]
    // convention as every other field above.
    amenities: get("amenities")
      .split("•")
      .map((a) => a.trim())
      .filter(Boolean),
    locationNote: get("locationNote") || null,
    videoUrl: get("videoUrl") || null,
    media,
    commission: get("commission"),
    guidePerson: get("guidePerson"),
    internalNotes: get("internalNotes"),
  };
}

export function BdsForm({ initial }: BdsFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [savedMessage, setSavedMessage] = useState<string>();
  const [media, setMedia] = useState<string[]>(initial?.media ?? []);
  const [uploaderState, setUploaderState] = useState<UploaderState>("empty");
  const [uploadError, setUploadError] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  useScrollToFirstError(fieldErrors);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploadError(undefined);
    setUploaderState("uploading");
    try {
      // Uploaded one at a time (not Promise.all) so a failure partway
      // through still keeps every image that succeeded before it, instead
      // of an all-or-nothing batch that could silently drop earlier results.
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

  function moveMedia(index: number, target: number) {
    setMedia((prev) => moveItem(prev, index, target));
  }

  async function save(form: HTMLFormElement, publish: boolean) {
    setSaving(publish ? "publish" : "draft");
    setFormError(undefined);
    setSavedMessage(undefined);
    try {
      const input = readInput(form, initial, media);
      const result = await saveBdsAction(input, publish);
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        setFormError(result.error);
        return;
      }
      setFieldErrors({});
      setSavedMessage(publish ? "Đã lưu và đăng." : "Đã lưu nháp.");
      router.refresh();
    } finally {
      setSaving(null);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void save(e.currentTarget, true);
  }

  function handleSaveDraft(e: MouseEvent<HTMLButtonElement>) {
    const form = e.currentTarget.closest("form");
    if (form) void save(form, false);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      {/* Stacked on mobile — title/description first, then the two save
          buttons as their own full-width row below — so the buttons never
          squeeze into the same line as a two-line title on a narrow screen.
          Desktop keeps the original side-by-side row. */}
      <div className="flex flex-col gap-4 desktop:flex-row desktop:items-center desktop:justify-between desktop:gap-3">
        <div>
          <h1 className="text-admin-title-mobile text-ink desktop:text-admin-title">Thêm / sửa BĐS</h1>
          <p className="mt-1 text-body text-muted">Nhập thông tin và xem trước nội dung hiển thị trên website.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving !== null}
            className="flex-1 min-h-[44px] rounded-md border border-primary px-6 py-3 text-button uppercase text-primary hover:bg-soft disabled:opacity-60 desktop:flex-none"
          >
            {saving === "draft" ? "Đang lưu..." : "Lưu nháp"}
          </button>
          <button
            type="submit"
            disabled={saving !== null}
            className="flex-1 min-h-[44px] rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover disabled:opacity-60 desktop:flex-none"
          >
            {saving === "publish" ? "Đang lưu..." : "Lưu & đăng"}
          </button>
        </div>
      </div>

      {formError && (
        <p role="alert" className="mt-4 text-body text-error">
          {formError}
        </p>
      )}
      {savedMessage && (
        <p role="status" className="mt-4 text-body text-success">
          {savedMessage}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-6">
        {/* This section IS the real /cho-thue/[slug] WEB layout — same
            hex colors/sizes as the public page, not the admin design
            tokens — so each field sits exactly where its value renders
            live. Uses the SAME `name` attributes readInput()/saveBdsAction
            already expect; only the visual treatment changed. */}
        <section className="overflow-hidden rounded-md border border-line bg-surface">
          <div className="flex items-center justify-between border-b border-line bg-soft px-6 py-3">
            <span className="text-label text-ink">Giao diện thật trên website</span>
            <span className="rounded-full bg-success/10 px-3 py-1 text-label text-success">HIỂN THỊ WEBSITE</span>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 min-[1100px]:grid-cols-[1fr_360px] min-[1100px]:items-start">
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
                  <div key={src + i} className="group overflow-hidden rounded-md border border-line bg-surface">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image src={src} alt={i === 0 ? "Ảnh chính BĐS" : `Ảnh thành phần ${i}`} fill className="object-cover" unoptimized />
                      <button
                        type="button"
                        onClick={() => removeMediaAt(i)}
                        aria-label={`Xóa ảnh ${i + 1}`}
                        className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-error"
                      >
                        <Icon2 name="close" size={16} />
                      </button>
                    </div>
                    <div className="p-2">
                      <p className={`text-[11px] font-semibold ${i === 0 ? "text-primary" : "text-ink"}`}>
                        {i === 0 ? "Ảnh chính · ngoài danh sách" : `Ảnh thành phần ${i} · thư viện ảnh`}
                      </p>
                      <div className="mt-1 flex min-h-[44px] items-center justify-end gap-1">
                      {i > 0 && (
                        <button type="button" onClick={() => moveMedia(i, 0)} aria-label={`Đặt ảnh ${i + 1} làm ảnh chính`} title="Đặt làm ảnh chính" className="mr-auto h-[44px] rounded border border-primary px-2 text-[10px] font-semibold text-primary hover:bg-primary hover:text-surface">
                          ĐẶT CHÍNH
                        </button>
                      )}
                      <button type="button" disabled={i === 0} onClick={() => moveMedia(i, i - 1)} aria-label={`Đưa ảnh ${i + 1} sang trái`} className="h-[44px] w-[44px] rounded border border-line text-base text-ink disabled:opacity-30" title="Đưa sang trái">
                        ←
                      </button>
                      <button type="button" disabled={i === media.length - 1} onClick={() => moveMedia(i, i + 1)} aria-label={`Đưa ảnh ${i + 1} sang phải`} className="h-[44px] w-[44px] rounded border border-line text-base text-ink disabled:opacity-30" title="Đưa sang phải">
                        →
                      </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-body text-muted">
                {media.length === 0
                  ? "Chưa có ảnh — đây là thư viện ảnh chính trên trang chi tiết. Có thể chọn nhiều ảnh cùng lúc."
                  : "Ảnh số 1 là ảnh chính dùng ngoài danh sách; các ảnh sau là ảnh thành phần trong thư viện ảnh. Dùng CHÍNH hoặc mũi tên để đổi thứ tự."}
              </p>
            </div>

            {/* Summary zone — title/address/price/facts/highlights/actions,
                exact same stack order + styling as the real WEB sidebar. */}
            <div className="min-w-0">
              <input
                name="roomNo"
                placeholder="Tên căn (VD: Sunrise City View)"
                defaultValue={initial?.roomNo}
                aria-label="Tên căn / Số phòng"
                aria-invalid={fieldErrors.roomNo ? true : undefined}
                aria-describedby={fieldErrors.roomNo ? "bds-roomNo-error" : undefined}
                className={`${wysiwygInput} text-[24px] font-extrabold leading-tight text-[#0C0D0D] placeholder:text-[#C9C6C5]`}
              />
              {fieldErrors.roomNo && (
                <p id="bds-roomNo-error" className="mt-1 text-body text-error">
                  {fieldErrors.roomNo}
                </p>
              )}

              <div className="mt-2 flex items-center gap-1">
                <Icon2 name="pin" size={13} className="shrink-0 text-[#5F5D5D]" />
                <input
                  name="address"
                  placeholder="Địa chỉ đầy đủ"
                  defaultValue={initial?.address}
                  aria-label="Địa chỉ"
                  aria-invalid={fieldErrors.address ? true : undefined}
                  aria-describedby={fieldErrors.address ? "bds-address-error" : undefined}
                  className={`${wysiwygInput} text-[13px] text-[#5F5D5D] placeholder:text-[#C9C6C5]`}
                />
              </div>
              {fieldErrors.address && (
                <p id="bds-address-error" className="mt-1 text-body text-error">
                  {fieldErrors.address}
                </p>
              )}

              <div className="mt-3 flex items-baseline gap-1">
                <input
                  name="price"
                  placeholder="6.500.000"
                  defaultValue={initial ? formatCurrencyVnd(initial.price) : undefined}
                  aria-label="Giá thuê"
                  aria-invalid={fieldErrors.price ? true : undefined}
                  aria-describedby={fieldErrors.price ? "bds-price-error" : undefined}
                  className={`${wysiwygInput} w-auto max-w-[180px] text-[26px] font-extrabold text-[#880206] placeholder:text-[#E0B3B4]`}
                />
                <span className="text-[14px] font-medium text-[#5F5D5D]">đ/tháng</span>
              </div>
              {fieldErrors.price && (
                <p id="bds-price-error" className="mt-1 text-body text-error">
                  {fieldErrors.price}
                </p>
              )}

              <div className="mt-4 grid grid-cols-4 gap-2">
                <div className="rounded-lg border border-[#EDEBEA] p-2 text-center">
                  <Icon2 name="area" size={20} className="mx-auto text-[#880206]" />
                  <input
                    name="area"
                    placeholder="35m²"
                    defaultValue={initial ? formatArea(initial.area) : undefined}
                    aria-label="Diện tích"
                    aria-invalid={fieldErrors.area ? true : undefined}
                    aria-describedby={fieldErrors.area ? "bds-area-error" : undefined}
                    className={`${wysiwygInput} mt-1 text-center text-[13px] font-bold text-[#0C0D0D] placeholder:text-[#C9C6C5]`}
                  />
                  <p className="text-[10px] text-[#5F5D5D]">Diện tích</p>
                  {/* Was validated server-side (bdsFormSchema requires a
                      parseable, positive area) but never actually shown
                      anywhere — a rejected save left this field's own
                      problem completely invisible, not just hard to find. */}
                  {fieldErrors.area && (
                    <p id="bds-area-error" className="mt-1 text-[10px] leading-tight text-error">
                      {fieldErrors.area}
                    </p>
                  )}
                </div>
                <div className="rounded-lg border border-[#EDEBEA] p-2 text-center">
                  <Icon2 name="bed" size={20} className="mx-auto text-[#880206]" />
                  <input
                    name="bedroomCount"
                    type="number"
                    min={0}
                    placeholder="—"
                    defaultValue={initial?.bedroomCount ?? undefined}
                    aria-label="Số phòng ngủ"
                    className={`${wysiwygInput} mt-1 text-center text-[13px] font-bold text-[#0C0D0D] placeholder:text-[#C9C6C5]`}
                  />
                  <p className="text-[10px] text-[#5F5D5D]">Phòng ngủ</p>
                </div>
                <div className="rounded-lg border border-[#EDEBEA] p-2 text-center">
                  <Icon2 name="bath" size={20} className="mx-auto text-[#880206]" />
                  <input
                    name="bathroomCount"
                    type="number"
                    min={0}
                    placeholder="—"
                    defaultValue={initial?.bathroomCount ?? undefined}
                    aria-label="Số phòng tắm"
                    className={`${wysiwygInput} mt-1 text-center text-[13px] font-bold text-[#0C0D0D] placeholder:text-[#C9C6C5]`}
                  />
                  <p className="text-[10px] text-[#5F5D5D]">Phòng tắm</p>
                </div>
                <div className="rounded-lg border border-[#EDEBEA] p-2 text-center">
                  <Icon2 name="check" size={20} className="mx-auto text-[#880206]" />
                  <input
                    name="furnishingStatus"
                    placeholder="—"
                    defaultValue={initial?.furnishingStatus ?? undefined}
                    aria-label="Tình trạng nội thất"
                    className={`${wysiwygInput} mt-1 truncate text-center text-[13px] font-bold text-[#0C0D0D] placeholder:text-[#C9C6C5]`}
                  />
                  <p className="text-[10px] text-[#5F5D5D]">Nội thất</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-[13px] font-bold text-[#0C0D0D]">Thông tin nổi bật</p>
                <textarea
                  name="highlights"
                  placeholder="Ban công • Nội thất • Vào ngay"
                  defaultValue={initial?.highlights.join(" • ")}
                  aria-label="Đặc điểm nổi bật"
                  rows={4}
                  className={`${wysiwygInput} mt-1 resize-none text-[13px] leading-relaxed text-[#3A3838] placeholder:text-[#C9C6C5]`}
                />
                <p className="text-body text-muted">Mỗi dòng cách nhau bằng dấu • — mỗi cụm hiện thành 1 dòng có dấu ✓ trên website.</p>
              </div>

              <div className="mt-4 flex gap-2">
                <span className="flex-1 rounded-md bg-[#880206] px-2 py-2 text-center text-[12px] font-semibold text-white">Gọi ngay</span>
                <span className="flex-1 rounded-md bg-[#0068FF] px-2 py-2 text-center text-[12px] font-semibold text-white">Nhắn Zalo</span>
              </div>
              <p className="mt-1 text-body text-muted">2 nút này cố định trên website (số hotline chung), không chỉnh theo từng căn.</p>
            </div>
          </div>

          {/* Detail-table zone — same rows/order as the "Thông tin chi tiết"
              tab on the real page. Diện tích/Giá thuê already editable
              above, so only the fields with no other home get an input
              here. */}
          <div className="border-t border-line px-6 py-6">
            <p className="text-[16px] font-bold text-[#0C0D0D]">Thông tin chi tiết</p>
            <div className="mt-3 divide-y divide-[#EDEBEA] rounded-lg border border-[#EDEBEA]">
              {/* Loại BĐS / Tình trạng are closed sets the server rejects
                  anything outside of. They were free-text boxes, so an
                  operator typing "chung cư" only found out after a failed
                  save — and the propertyType error was never even rendered.
                  A select can only produce a value that saves. */}
              <div className="flex items-center justify-between px-4 py-3 text-[13px]">
                <span className="text-[#5F5D5D]">Loại BĐS</span>
                <select
                  name="propertyType"
                  defaultValue={initial?.propertyType ?? ""}
                  aria-label="Loại phòng / BĐS"
                  aria-invalid={fieldErrors.propertyType ? true : undefined}
                  aria-describedby={fieldErrors.propertyType ? "bds-propertyType-error" : undefined}
                  className="w-[200px] rounded-md border border-[#EDEBEA] px-2 py-1 text-right font-bold text-[#0C0D0D] outline-none transition-colors duration-fast ease-base focus:border-[#880206]"
                >
                  <option value="">— Chọn loại —</option>
                  {PROPERTY_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              {fieldErrors.propertyType && (
                <p id="bds-propertyType-error" className="px-4 py-2 text-right text-body text-error">
                  {fieldErrors.propertyType}
                </p>
              )}
              {/* Diện tích/Giá thuê used to repeat here as plain text
                  ("(nhập ở ô Diện tích phía trên)") pointing back up at the
                  real inputs — dead weight that read like a broken field,
                  not an instruction, since it never became a value: an
                  operator can already edit both directly in the preview
                  above. Dropped rather than kept as a pointer to elsewhere
                  on the same screen. */}
              <div className="flex items-center justify-between px-4 py-3 text-[13px]">
                <span className="text-[#5F5D5D]">Phí dịch vụ</span>
                <input
                  name="serviceFee"
                  placeholder="Theo tháng"
                  defaultValue={initial?.serviceFee}
                  aria-label="Phí dịch vụ"
                  className="w-[160px] rounded-md border border-[#EDEBEA] px-2 py-1 text-right font-bold text-[#0C0D0D] outline-none transition-colors duration-fast ease-base placeholder:text-[#C9C6C5] focus:border-[#880206]"
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-[13px]">
                <span className="text-[#5F5D5D]">Thang</span>
                <input
                  name="verticalAccess"
                  placeholder="Có"
                  defaultValue={initial?.verticalAccess}
                  aria-label="Thang"
                  className="w-[160px] rounded-md border border-[#EDEBEA] px-2 py-1 text-right font-bold text-[#0C0D0D] outline-none transition-colors duration-fast ease-base placeholder:text-[#C9C6C5] focus:border-[#880206]"
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-[13px]">
                <span className="text-[#5F5D5D]">Tình trạng</span>
                <select
                  name="availability"
                  defaultValue={initial?.availability ?? ""}
                  aria-label="Thời gian vào / trạng thái"
                  aria-invalid={fieldErrors.availability ? true : undefined}
                  aria-describedby={fieldErrors.availability ? "bds-availability-error" : undefined}
                  className="w-[200px] rounded-md border border-[#EDEBEA] px-2 py-1 text-right font-bold text-[#0C0D0D] outline-none transition-colors duration-fast ease-base focus:border-[#880206]"
                >
                  <option value="">— Chọn tình trạng —</option>
                  {AVAILABILITY_OPTIONS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              {fieldErrors.availability && (
                <p id="bds-availability-error" className="px-4 py-2 text-right text-body text-error">
                  {fieldErrors.availability}
                </p>
              )}
            </div>
          </div>

          {/* Nội dung 3 tab còn lại trên trang chi tiết (Tiện ích/Vị trí/
              Video & Hình ảnh) — trước đây các tab này chỉ hiện "Thông tin
              đang được cập nhật." vì không có field nào đứng sau; giờ nhập
              ở đây sẽ hiện thật trên web. Hình ảnh dùng chung gallery phía
              trên, không cần nhập lại. */}
          <div className="border-t border-line px-6 py-6">
            <p className="text-[16px] font-bold text-[#0C0D0D]">Nội dung tab Tiện ích / Vị trí / Video</p>
            <div className="mt-3 flex flex-col gap-4">
              <div>
                <label htmlFor="bds-amenities" className="text-[13px] font-bold text-[#0C0D0D]">
                  Tiện ích
                </label>
                <textarea
                  id="bds-amenities"
                  name="amenities"
                  placeholder="Hồ bơi • Gym • Công viên nội khu • An ninh 24/7"
                  defaultValue={initial?.amenities.join(" • ")}
                  rows={3}
                  className={`${wysiwygInput} mt-1 resize-none rounded-md border border-[#EDEBEA] p-2 text-[13px] leading-relaxed text-[#3A3838] placeholder:text-[#C9C6C5] hover:border-[#EDEBEA] focus:border-[#880206]`}
                />
                <p className="text-body text-muted">Mỗi tiện ích cách nhau bằng dấu • — để trống nếu chưa có.</p>
              </div>
              <div>
                <label htmlFor="bds-locationNote" className="text-[13px] font-bold text-[#0C0D0D]">
                  Mô tả vị trí
                </label>
                <textarea
                  id="bds-locationNote"
                  name="locationNote"
                  placeholder="Gần chợ, trường học, kết nối thuận tiện về trung tâm..."
                  defaultValue={initial?.locationNote ?? undefined}
                  rows={2}
                  className={`${wysiwygInput} mt-1 resize-none rounded-md border border-[#EDEBEA] p-2 text-[13px] leading-relaxed text-[#3A3838] placeholder:text-[#C9C6C5] hover:border-[#EDEBEA] focus:border-[#880206]`}
                />
              </div>
              <div>
                <label htmlFor="bds-videoUrl" className="text-[13px] font-bold text-[#0C0D0D]">
                  Đường dẫn video
                </label>
                <input
                  id="bds-videoUrl"
                  name="videoUrl"
                  placeholder="https://youtube.com/watch?v=..."
                  defaultValue={initial?.videoUrl ?? undefined}
                  className={`${wysiwygInput} mt-1 rounded-md border border-[#EDEBEA] p-2 text-[13px] text-[#3A3838] placeholder:text-[#C9C6C5] hover:border-[#EDEBEA] focus:border-[#880206]`}
                />
                <p className="text-body text-muted">Để trống nếu chưa có video — tab vẫn hiện thư viện ảnh bình thường.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-line px-6 py-6">
            <FormField
              label="Mô tả chi tiết"
              name="description"
              type="textarea"
              placeholder="Nội dung hiển thị trên website..."
              defaultValue={initial?.description}
            />
          </div>
        </section>

        {/* Vận hành nội bộ — không hiển thị ở bất kỳ đâu trên trang public
            (dùng để nhóm dữ liệu và filter), nên KHÔNG đưa vào khối "giao
            diện thật" ở trên để khỏi gây nhầm "cái này có hiện trên web". */}
        {/* "Khu / tòa nhà" used to live here. readInput() never read it and
            no such field exists on the record, so everything typed into it
            was discarded on save — the building name is already part of
            roomNo ("P.301 - Tòa A"), which IS persisted. */}
        <FormSection title="Thông tin dùng để tìm kiếm">
          <FormField
            label="Vị trí / khu vực"
            name="location"
            required
            placeholder="Hà Nội"
            defaultValue={initial?.location}
            hint="Dùng để khách lọc theo khu vực ở trang Cho thuê."
            error={fieldErrors.location}
          />
        </FormSection>

        <FormSection title="Thông tin nội bộ" internalOnly>
          <FormField
            label="Hoa hồng"
            name="commission"
            placeholder="Ví dụ: 1 tháng tiền thuê"
            defaultValue={initial?.commission}
          />
          <FormField
            label="Người dẫn"
            name="guidePerson"
            placeholder="Họ tên và số điện thoại"
            defaultValue={initial?.guidePerson}
          />
          <div className="desktop:col-span-2">
            <FormField
              label="Ghi chú nội bộ"
              name="internalNotes"
              type="textarea"
              placeholder="Nhập ghi chú dành cho nội bộ"
              defaultValue={initial?.internalNotes}
            />
          </div>
        </FormSection>
      </div>
    </form>
  );
}
