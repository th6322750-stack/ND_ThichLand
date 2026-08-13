"use client";

import { useState } from "react";
import Image from "next/image";
import { FormField } from "@/components/public/FormField";
import { FormSection } from "@/components/admin/FormSection";
import { Uploader } from "@/components/admin/Uploader";
import type { AdminPropertyRecord } from "@/lib/types";

interface BdsFormProps {
  initial?: AdminPropertyRecord;
}

export function BdsForm({ initial }: BdsFormProps) {
  const [saving, setSaving] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSaving(true);
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-admin-title-mobile text-ink desktop:text-admin-title">Thêm / sửa BĐS</h1>
          <p className="mt-1 text-body text-muted">Form bám schema Sheet thực tế; public và internal được tách rõ.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-md border border-primary px-6 py-3 text-button uppercase text-primary hover:bg-soft"
          >
            Lưu nháp
          </button>
          <button
            type="submit"
            className="rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
          >
            {saving ? "Đang lưu..." : "Lưu & đăng"}
          </button>
        </div>
      </div>

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
          />
          <FormField
            label="Địa chỉ"
            name="address"
            required
            placeholder="Nhập địa chỉ"
            defaultValue={initial?.address}
          />
          <FormField
            label="Số phòng / mã"
            name="roomNo"
            placeholder="P.301"
            defaultValue={initial?.roomNo}
            hint="Mã vận hành"
          />
          <FormField
            label="Giá thuê"
            name="price"
            required
            placeholder="6.500.000"
            defaultValue={initial ? String(initial.price) : undefined}
            hint="Public"
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
            defaultValue={initial ? String(initial.area) : undefined}
            hint="Public + filter"
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
            <Uploader state="empty" />
            {(initial?.media ?? []).map((src, i) => (
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
