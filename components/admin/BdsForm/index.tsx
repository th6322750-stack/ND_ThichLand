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
import type { AdminPropertyRecord } from "@/lib/types";

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
    bedroomCount: get("bedroomCount") ? Number(get("bedroomCount")) : null,
    bathroomCount: get("bathroomCount") ? Number(get("bathroomCount")) : null,
    furnishingStatus: get("furnishingStatus") || null,
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-admin-title-mobile text-ink desktop:text-admin-title">Thêm / sửa BĐS</h1>
          <p className="mt-1 text-body text-muted">Form bám schema Sheet thực tế; public và internal được tách rõ.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving !== null}
            className="rounded-md border border-primary px-6 py-3 text-button uppercase text-primary hover:bg-soft disabled:opacity-60"
          >
            {saving === "draft" ? "Đang lưu..." : "Lưu nháp"}
          </button>
          <button
            type="submit"
            disabled={saving !== null}
            className="rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover disabled:opacity-60"
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
                <Uploader state={uploaderState} onClick={() => fileInputRef.current?.click()} onRetry={() => setUploaderState("empty")} />
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
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        Ảnh chính
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeMediaAt(i)}
                      aria-label={`Xóa ảnh ${i + 1}`}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-error group-hover:opacity-100"
                    >
                      <Icon2 name="close" size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-body text-muted">
                {media.length === 0
                  ? "Chưa có ảnh — đây là khu vực gallery chính trên trang chi tiết. Có thể chọn nhiều ảnh cùng lúc."
                  : "Có thể bấm ô tải ảnh nhiều lần hoặc chọn nhiều ảnh cùng lúc để thêm; ảnh đầu tiên là ảnh chính."}
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
                className={`${wysiwygInput} text-[24px] font-extrabold leading-tight text-[#0C0D0D] placeholder:text-[#C9C6C5]`}
              />
              {fieldErrors.roomNo && <p className="mt-1 text-body text-error">{fieldErrors.roomNo}</p>}

              <div className="mt-2 flex items-center gap-1">
                <Icon2 name="pin" size={13} className="shrink-0 text-[#5F5D5D]" />
                <input
                  name="address"
                  placeholder="Địa chỉ đầy đủ"
                  defaultValue={initial?.address}
                  aria-label="Địa chỉ"
                  className={`${wysiwygInput} text-[13px] text-[#5F5D5D] placeholder:text-[#C9C6C5]`}
                />
              </div>
              {fieldErrors.address && <p className="mt-1 text-body text-error">{fieldErrors.address}</p>}

              <div className="mt-3 flex items-baseline gap-1">
                <input
                  name="price"
                  placeholder="6.500.000"
                  defaultValue={initial ? formatCurrencyVnd(initial.price) : undefined}
                  aria-label="Giá thuê"
                  className={`${wysiwygInput} w-auto max-w-[180px] text-[26px] font-extrabold text-[#880206] placeholder:text-[#E0B3B4]`}
                />
                <span className="text-[14px] font-medium text-[#5F5D5D]">đ/tháng</span>
              </div>
              {fieldErrors.price && <p className="mt-1 text-body text-error">{fieldErrors.price}</p>}

              <div className="mt-4 grid grid-cols-4 gap-2">
                <div className="rounded-lg border border-[#EDEBEA] p-2 text-center">
                  <Icon2 name="area" size={20} className="mx-auto text-[#880206]" />
                  <input
                    name="area"
                    placeholder="35m²"
                    defaultValue={initial ? formatArea(initial.area) : undefined}
                    aria-label="Diện tích"
                    className={`${wysiwygInput} mt-1 text-center text-[13px] font-bold text-[#0C0D0D] placeholder:text-[#C9C6C5]`}
                  />
                  <p className="text-[10px] text-[#5F5D5D]">Diện tích</p>
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
                <p className="text-body text-muted">Mỗi dòng cách nhau bằng dấu • — mỗi cụm hiện thành 1 dòng có dấu ✓ trên web.</p>
              </div>

              <div className="mt-4 flex gap-2">
                <span className="flex-1 rounded-md bg-[#880206] px-2 py-2 text-center text-[12px] font-semibold text-white">Gọi ngay</span>
                <span className="flex-1 rounded-md bg-[#0068FF] px-2 py-2 text-center text-[12px] font-semibold text-white">Nhắn Zalo</span>
              </div>
              <p className="mt-1 text-body text-muted">2 nút này cố định trên web (số hotline chung), không chỉnh theo từng căn.</p>
            </div>
          </div>

          {/* Detail-table zone — same rows/order as the "Thông tin chi tiết"
              tab on the real page. Diện tích/Giá thuê already editable
              above, so only the fields with no other home get an input
              here. */}
          <div className="border-t border-line px-6 py-6">
            <p className="text-[16px] font-bold text-[#0C0D0D]">Thông tin chi tiết</p>
            <div className="mt-3 divide-y divide-[#EDEBEA] rounded-lg border border-[#EDEBEA]">
              <div className="flex items-center justify-between px-4 py-3 text-[13px]">
                <span className="text-[#5F5D5D]">Loại BĐS</span>
                <input
                  name="propertyType"
                  placeholder="Studio"
                  defaultValue={initial?.propertyType ?? undefined}
                  aria-label="Loại phòng / BĐS"
                  className={`${wysiwygInput} w-[160px] text-right font-bold text-[#0C0D0D] placeholder:text-[#C9C6C5]`}
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-[13px]">
                <span className="text-[#5F5D5D]">Diện tích</span>
                <span className="font-bold text-[#0C0D0D]">(nhập ở ô Diện tích phía trên)</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-[13px]">
                <span className="text-[#5F5D5D]">Giá thuê</span>
                <span className="font-bold text-[#0C0D0D]">(nhập ở ô Giá thuê phía trên)</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-[13px]">
                <span className="text-[#5F5D5D]">Phí dịch vụ</span>
                <input
                  name="serviceFee"
                  placeholder="Theo tháng"
                  defaultValue={initial?.serviceFee}
                  aria-label="Phí dịch vụ"
                  className={`${wysiwygInput} w-[160px] text-right font-bold text-[#0C0D0D] placeholder:text-[#C9C6C5]`}
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-[13px]">
                <span className="text-[#5F5D5D]">Thang</span>
                <input
                  name="verticalAccess"
                  placeholder="Có"
                  defaultValue={initial?.verticalAccess}
                  aria-label="Thang"
                  className={`${wysiwygInput} w-[160px] text-right font-bold text-[#0C0D0D] placeholder:text-[#C9C6C5]`}
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-[13px]">
                <span className="text-[#5F5D5D]">Tình trạng</span>
                <input
                  name="availability"
                  placeholder="Còn trống"
                  defaultValue={initial?.availability ?? undefined}
                  aria-label="Thời gian vào / trạng thái"
                  className={`${wysiwygInput} w-[160px] text-right font-bold text-[#0C0D0D] placeholder:text-[#C9C6C5]`}
                />
                {fieldErrors.availability && <p className="mt-1 w-full text-right text-body text-error">{fieldErrors.availability}</p>}
              </div>
            </div>
          </div>

          <div className="border-t border-line px-6 py-6">
            <FormField
              label="Mô tả chi tiết"
              name="description"
              type="textarea"
              placeholder="Nội dung public..."
              defaultValue={initial?.description}
            />
          </div>
        </section>

        {/* Vận hành nội bộ — không hiển thị ở bất kỳ đâu trên trang public
            (dùng để nhóm dữ liệu và filter), nên KHÔNG đưa vào khối "giao
            diện thật" ở trên để khỏi gây nhầm "cái này có hiện trên web". */}
        <FormSection title="Dữ liệu vận hành (không hiển thị trực tiếp)">
          <FormField
            label="Khu / tòa nhà"
            name="building"
            placeholder="VD: Tòa A"
            defaultValue={initial?.roomNo.split(" - ")[1]}
            hint="Dùng để nhóm dữ liệu"
          />
          <FormField
            label="Vị trí / khu vực"
            name="location"
            required
            placeholder="Hà Nội"
            defaultValue={initial?.location}
            hint="Filter public"
            error={fieldErrors.location}
          />
        </FormSection>

        <FormSection title="Thông tin INTERNAL-ONLY" internalOnly>
          <FormField
            label="Hoa hồng"
            name="commission"
            placeholder="Theo dữ liệu"
            defaultValue={initial?.commission}
            hint="INTERNAL"
          />
          <FormField
            label="Người dẫn"
            name="guidePerson"
            placeholder="Tên / SĐT"
            defaultValue={initial?.guidePerson}
            hint="INTERNAL"
          />
          <div className="desktop:col-span-2">
            <FormField
              label="Ghi chú nội bộ"
              name="internalNotes"
              type="textarea"
              placeholder="Ghi chú vận hành"
              defaultValue={initial?.internalNotes}
              hint="INTERNAL"
            />
          </div>
        </FormSection>
      </div>
    </form>
  );
}
