"use client";

import { FormField } from "@/components/public/FormField";
import { Uploader } from "@/components/admin/Uploader";
import type { NewsArticle } from "@/lib/types";

interface TinTucFormProps {
  initial?: NewsArticle;
}

const TOOLBAR = ["H1", "H2", "Bold", "Link", "Image", "Quote"];

export function TinTucForm({ initial }: TinTucFormProps) {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-admin-title-mobile text-ink desktop:text-admin-title">Thêm / sửa tin tức</h1>
          <p className="mt-1 text-body text-muted">Editor nội dung có ảnh đại diện và nội dung dài.</p>
        </div>
        <button
          type="submit"
          className="rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
        >
          Lưu
        </button>
      </div>

      <section className="mt-6 rounded-md border border-line bg-surface p-6">
        <h2 className="text-h3 text-ink">Nội dung bài viết</h2>
        <div className="mt-4">
          <FormField label="Tiêu đề" name="title" required defaultValue={initial?.title} />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 min-[1200px]:grid-cols-2">
          <FormField label="Danh mục" name="category" required defaultValue={initial?.category} />
          <FormField
            label="Trạng thái"
            name="status"
            required
            defaultValue={initial ? "Đã xuất bản" : "Nháp"}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 min-[1200px]:grid-cols-2">
          <div>
            <span className="text-label text-ink">Ảnh đại diện</span>
            <div className="mt-2 aspect-video">
              <Uploader state="empty" />
            </div>
          </div>
          <FormField
            label="Mô tả ngắn"
            name="excerpt"
            type="textarea"
            placeholder="Tóm tắt dùng ở NewsCard..."
            defaultValue={initial?.excerpt}
          />
        </div>

        <div className="mt-6">
          <span className="text-label text-ink">Nội dung bài</span>
          <div className="mt-2 rounded-md border border-line bg-soft p-6">
            <div className="flex flex-wrap gap-4 border-b border-line pb-3 text-body text-muted">
              {TOOLBAR.map((tool) => (
                <span key={tool}>{tool}</span>
              ))}
            </div>
            <p className="mt-4 text-body text-ink">
              {initial?.sections[0]?.body ?? "Nội dung bài viết dạng rich text..."}
            </p>
            <p className="mt-2 text-body text-muted">Giữ typography role đã khóa trong frontend.</p>
          </div>
        </div>
      </section>
    </form>
  );
}
