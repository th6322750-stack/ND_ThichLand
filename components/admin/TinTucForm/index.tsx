"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/public/FormField";
import { Uploader, type UploaderState } from "@/components/admin/Uploader";
import { saveNewsAction, type NewsFormInput } from "@/app/actions/news";
import { uploadMediaAction } from "@/app/actions/media";
import type { NewsRecord } from "@/lib/server/news/repository";

interface TinTucFormProps {
  initial?: NewsRecord;
}

const TOOLBAR = ["H1", "H2", "Bold", "Link", "Image", "Quote"];

export function TinTucForm({ initial }: TinTucFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string>();
  const [cover, setCover] = useState(initial?.cover ?? "");
  const [uploaderState, setUploaderState] = useState<UploaderState>(cover ? "success" : "empty");
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
      setCover(result.record.webViewLink);
      setUploaderState("success");
    } catch {
      setUploaderState("error");
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(undefined);
    setSaved(undefined);
    try {
      const data = new FormData(e.currentTarget);
      const get = (name: string) => String(data.get(name) ?? "").trim();
      const publish = get("status") ? get("status") === "Đã xuất bản" : (initial?.published ?? false);

      const input: NewsFormInput = {
        slug: initial?.slug ?? "",
        title: get("title"),
        category: get("category"),
        excerpt: get("excerpt"),
        cover,
        sections: initial?.sections ?? [],
        readMinutes: initial?.readMinutes ?? 0,
      };

      const result = await saveNewsAction(input, publish);
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        setError(result.error);
        return;
      }
      setFieldErrors({});
      setSaved("Đã lưu bài viết.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-admin-title-mobile text-ink desktop:text-admin-title">Thêm / sửa tin tức</h1>
          <p className="mt-1 text-body text-muted">Editor nội dung có ảnh đại diện và nội dung dài.</p>
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
        <h2 className="text-h3 text-ink">Nội dung bài viết</h2>
        <div className="mt-4">
          <FormField label="Tiêu đề" name="title" required defaultValue={initial?.title} error={fieldErrors.title} />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 min-[1200px]:grid-cols-2">
          <FormField
            label="Danh mục"
            name="category"
            required
            defaultValue={initial?.category}
            error={fieldErrors.category}
          />
          <FormField
            label="Trạng thái"
            name="status"
            required
            defaultValue={initial?.published ? "Đã xuất bản" : "Nháp"}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 min-[1200px]:grid-cols-2">
          <div>
            <span className="text-label text-ink">Ảnh đại diện</span>
            <div className="mt-2 aspect-video">
              <Uploader
                state={uploaderState}
                onClick={() => fileInputRef.current?.click()}
                onRetry={() => setUploaderState("empty")}
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
              onChange={handleFileChange}
            />
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
