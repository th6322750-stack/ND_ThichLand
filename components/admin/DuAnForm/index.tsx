"use client";

import { FormField } from "@/components/public/FormField";
import { Icon } from "@/components/icons";
import type { ProjectListing } from "@/lib/types";

interface DuAnFormProps {
  initial?: ProjectListing;
}

export function DuAnForm({ initial }: DuAnFormProps) {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-admin-title-mobile text-ink desktop:text-admin-title">Thêm / sửa dự án</h1>
          <p className="mt-1 text-body text-muted">Các field đúng scope dự án đã khảo sát.</p>
        </div>
        <button
          type="submit"
          className="rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
        >
          Lưu
        </button>
      </div>

      <section className="mt-6 rounded-md border border-line bg-surface p-6">
        <h2 className="text-h3 text-ink">Thông tin dự án</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 min-[1200px]:grid-cols-2">
          <FormField label="Tên dự án" name="name" required defaultValue={initial?.name} />
          <FormField label="Vị trí" name="location" required defaultValue={initial?.location ?? "Theo CMS"} />
          <FormField label="Chủ đầu tư" name="investor" required defaultValue="Theo CMS" />
          <FormField label="Trạng thái" name="status" required defaultValue={initial?.status} />
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
          <FormField
            label="Tiện ích"
            name="amenities"
            type="textarea"
            placeholder="Danh sách tiện ích..."
            defaultValue={initial?.amenities.join(", ")}
          />
        </div>
        <div className="mt-6">
          <FormField
            label="Tiến độ"
            name="progress"
            type="textarea"
            placeholder="Nội dung tiến độ..."
            defaultValue={initial ? `${initial.progressPercent}% hoàn thành` : undefined}
          />
        </div>

        <div className="mt-6">
          <span className="text-label text-ink">Album ảnh</span>
          <button
            type="button"
            className="mt-2 flex w-full items-center gap-2 rounded-md border-2 border-dashed border-line p-6 text-label text-primary hover:border-primary"
          >
            <Icon name="upload" size={18} /> Tải / chọn media
          </button>
        </div>
      </section>
    </form>
  );
}
