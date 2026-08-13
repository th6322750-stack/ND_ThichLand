"use client";

import { useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FormField } from "@/components/public/FormField";
import { FormSection } from "@/components/admin/FormSection";
import { Uploader, type UploaderState } from "@/components/admin/Uploader";
import { saveBdsAction, type BdsFormInput } from "@/app/actions/bds";
import { uploadMediaAction } from "@/app/actions/media";
import { formatArea, formatCurrencyVnd } from "@/lib/format";
import type { AdminPropertyRecord } from "@/lib/types";

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
    propertyType: get("propertyType") || (initial?.propertyType ?? "Nhà"),
    description: get("description"),
    highlights: get("highlights")
      .split("•")
      .map((h) => h.trim())
      .filter(Boolean),
    availability: get("availability") || (initial?.availability ?? "Còn trống"),
    // No approved form control exists for these two yet — pass the current
    // value through unchanged rather than inventing a new field.
    bedroomCount: initial?.bedroomCount ?? null,
    furnishingStatus: initial?.furnishingStatus ?? null,
    media,
    commission: get("commission"),
    guidePerson: get("guidePerson"),
    internalNotes: get("internalNotes"),
  };
}

export function BdsForm({ initial }: BdsFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [savedMessage, setSavedMessage] = useState<string>();
  const [media, setMedia] = useState<string[]>(initial?.media ?? []);
  const [uploaderState, setUploaderState] = useState<UploaderState>("empty");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploaderState("uploading");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadMediaAction(formData);
      if (!result.ok || !result.record) {
        setUploaderState("error");
        return;
      }
      setMedia((prev) => [...prev, result.record!.webViewLink]);
      setUploaderState("empty");
    } catch {
      setUploaderState("error");
    }
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
    <form onSubmit={handleSubmit} noValidate>
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
        <FormSection title="Thông tin public" badge="HIỂN THỊ WEBSITE">
          <FormField
            label="Khu / tòa nhà"
            name="building"
            placeholder="VD: Tòa A"
            defaultValue={initial?.roomNo.split(" - ")[1]}
            hint="Dùng để nhóm dữ liệu"
          />
          <FormField
            label="Thời gian vào / trạng thái"
            name="availability"
            placeholder="Còn trống"
            defaultValue={initial?.availability}
            hint="Chuẩn hóa trạng thái"
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
          <FormField
            label="Địa chỉ"
            name="address"
            required
            placeholder="Nhập địa chỉ"
            defaultValue={initial?.address}
            error={fieldErrors.address}
          />
          <FormField
            label="Số phòng / mã"
            name="roomNo"
            placeholder="P.301"
            defaultValue={initial?.roomNo}
            hint="Mã vận hành"
            error={fieldErrors.roomNo}
          />
          <FormField
            label="Giá thuê"
            name="price"
            required
            placeholder="6.500.000"
            defaultValue={initial ? formatCurrencyVnd(initial.price) : undefined}
            hint="Public"
            error={fieldErrors.price}
          />
          <FormField
            label="Phí dịch vụ"
            name="serviceFee"
            placeholder="Theo tháng"
            defaultValue={initial?.serviceFee}
          />
          <FormField
            label="Diện tích"
            name="area"
            required
            placeholder="35m²"
            defaultValue={initial ? formatArea(initial.area) : undefined}
            hint="Public + filter"
            error={fieldErrors.area}
          />
          <FormField
            label="Thang"
            name="verticalAccess"
            placeholder="Có"
            defaultValue={initial?.verticalAccess}
            hint="Public"
          />
          <FormField
            label="Loại phòng / BĐS"
            name="propertyType"
            required
            placeholder="Studio"
            defaultValue={initial?.propertyType}
            hint="Public + filter"
          />
        </FormSection>

        <section className="rounded-md border border-line bg-surface p-6">
          <h2 className="text-h3 text-ink">Ảnh / video</h2>
          <p className="mt-1 text-body text-muted">Hỗ trợ hyperlink Drive/Photos sau khi backend normalization.</p>
          <div className="mt-4 grid grid-cols-2 gap-4 tablet:grid-cols-4">
            <Uploader state={uploaderState} onClick={() => fileInputRef.current?.click()} onRetry={() => setUploaderState("empty")} />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
              onChange={handleFileChange}
            />
            {media.map((src, i) => (
              <div key={src + i} className="relative aspect-[4/3] overflow-hidden rounded-md">
                <Image src={src} alt={`Ảnh ${i + 1}`} fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-line bg-surface p-6">
          <h2 className="text-h3 text-ink">Nội dung mô tả</h2>
          <div className="mt-4 flex flex-col gap-6">
            <FormField
              label="Mô tả chi tiết"
              name="description"
              type="textarea"
              placeholder="Nội dung public..."
              defaultValue={initial?.description}
            />
            <FormField
              label="Đặc điểm nổi bật"
              name="highlights"
              type="textarea"
              placeholder="Ban công • Nội thất • Vào ngay"
              defaultValue={initial?.highlights.join(" • ")}
            />
          </div>
        </section>

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
