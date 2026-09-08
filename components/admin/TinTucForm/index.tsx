"use client";

import { useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Uploader, type UploaderState } from "@/components/admin/Uploader";
import { Icon } from "@/components/icons";
import { saveNewsAction, type NewsFormInput } from "@/app/actions/news";
import { uploadMediaAction } from "@/app/actions/media";
import type { NewsRecord } from "@/lib/server/news/repository";
import { useScrollToFirstError } from "@/lib/useScrollToFirstError";

interface TinTucFormProps {
  initial?: NewsRecord;
  /** Categories already in use, offered as suggestions so the public
      /tin-tuc chips (which are derived from real data) stay coherent. */
  knownCategories?: string[];
}

/**
 * Same WYSIWYG treatment as BdsForm/DuAnForm: the fields are styled with the
 * public article page's own look and sit where their value renders, so the
 * editor can see the shape of the published page while typing.
 *
 * What this replaces: the previous version rendered six inert <span>s
 * ("H1 H2 Bold Link Image Quote") as a fake toolbar, showed section[0].body
 * as static text, and passed `sections: initial?.sections ?? []` straight
 * through — the body of an article was literally not editable anywhere in
 * the CMS. "Trạng thái" was a free-text box compared against the exact
 * string "Đã xuất bản", so a typo silently saved the article as a draft.
 */
const wysiwygInput =
  "w-full border-0 border-b border-dashed border-transparent bg-transparent p-0 outline-none transition-colors duration-fast ease-base hover:border-[#E8E2DF] focus:border-[#8A1822]";

type Section = { heading: string; body: string };

export function TinTucForm({ initial, knownCategories = [] }: TinTucFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  useScrollToFirstError(fieldErrors);
  const [saved, setSaved] = useState<string>();
  const [cover, setCover] = useState(initial?.cover ?? "");
  const [uploaderState, setUploaderState] = useState<UploaderState>("empty");
  const [uploadError, setUploadError] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sections, setSections] = useState<Section[]>(
    initial?.sections?.length ? initial.sections : [{ heading: "", body: "" }],
  );

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError(undefined);
    setUploaderState("uploading");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadMediaAction(formData);
      if (!result.ok || !result.record) {
        setUploadError(result.error ?? "Không thể tải ảnh lên. Vui lòng thử lại.");
        setUploaderState("error");
        return;
      }
      setCover(result.record.webViewLink);
      setUploadError(undefined);
      setUploaderState("empty");
    } catch {
      setUploadError("Không thể tải ảnh lên. Vui lòng thử lại.");
      setUploaderState("error");
    }
  }

  function removeCover() {
    setCover("");
    setUploadError(undefined);
    setUploaderState("empty");
  }

  function updateSection(index: number, patch: Partial<Section>) {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function addSection() {
    setSections((prev) => [...prev, { heading: "", body: "" }]);
  }

  function removeSection(index: number) {
    setSections((prev) => (prev.length === 1 ? [{ heading: "", body: "" }] : prev.filter((_, i) => i !== index)));
  }

  function moveSection(index: number, delta: number) {
    setSections((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      // Non-null: target is bounds-checked above, and index always comes
      // from mapping over this same sections array.
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }

  async function save(form: HTMLFormElement, publish: boolean) {
    setSaving(publish ? "publish" : "draft");
    setError(undefined);
    setSaved(undefined);
    try {
      const data = new FormData(form);
      const get = (name: string) => String(data.get(name) ?? "").trim();

      const input: NewsFormInput = {
        slug: initial?.slug ?? "",
        title: get("title"),
        category: get("category"),
        excerpt: get("excerpt"),
        cover,
        // Drops trailing blank blocks the editor added but never filled, so
        // an empty section can't reach the public page.
        sections: sections
          .map((s) => ({ heading: s.heading.trim(), body: s.body.trim() }))
          .filter((s) => s.heading || s.body),
      };

      const result = await saveNewsAction(input, publish);
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        setError(result.error);
        return;
      }
      setFieldErrors({});
      setSaved(publish ? "Đã lưu và xuất bản." : "Đã lưu nháp (chưa hiện trên website).");
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

  const publishedLabel = initial?.published ? "Đang hiện trên website" : "Đang là bản nháp";

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Stacked on mobile — title/description first, then the two save
          buttons as their own full-width row below — so the buttons never
          squeeze into the same line as a two-line title on a narrow screen.
          Desktop keeps the original side-by-side row. */}
      <div className="flex flex-col gap-4 desktop:flex-row desktop:items-center desktop:justify-between desktop:gap-3">
        <div>
          <h1 className="text-admin-title-mobile text-ink desktop:text-admin-title">Thêm / sửa tin tức</h1>
          <p className="mt-1 text-body text-muted">
            Nhập nội dung và xem trước bài viết trên website. {initial ? publishedLabel : "Bài viết mới."}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving !== null}
            className="flex-1 min-h-[44px] rounded-md border border-primary px-6 py-3 text-button uppercase text-primary transition-colors duration-fast ease-base hover:bg-soft disabled:opacity-60 desktop:flex-none"
          >
            {saving === "draft" ? "Đang lưu..." : "Lưu nháp"}
          </button>
          <button
            type="submit"
            disabled={saving !== null}
            className="flex-1 min-h-[44px] rounded-md bg-primary px-6 py-3 text-button uppercase text-surface transition-colors duration-fast ease-base hover:bg-primaryHover disabled:opacity-60 desktop:flex-none"
          >
            {saving === "publish" ? "Đang lưu..." : "Lưu & xuất bản"}
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

      <section className="mt-6 overflow-hidden rounded-md border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line bg-soft px-6 py-3">
          <span className="text-label text-ink">Giao diện thật trên website</span>
          <span className="rounded-full bg-success/10 px-3 py-1 text-label text-success">HIỂN THỊ WEBSITE</span>
        </div>

        <div className="p-6">
          {/* Category eyebrow + title, same order/size as the article page. */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              name="category"
              list="tin-tuc-categories"
              placeholder="DANH MỤC"
              defaultValue={initial?.category}
              aria-label="Danh mục"
              aria-invalid={fieldErrors.category ? true : undefined}
              aria-describedby={fieldErrors.category ? "tin-tuc-category-error" : undefined}
              className={`${wysiwygInput} w-auto max-w-[220px] text-label uppercase text-primary placeholder:text-[#C9C6C5]`}
            />
            <datalist id="tin-tuc-categories">
              {knownCategories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          {fieldErrors.category && (
            <p id="tin-tuc-category-error" className="mt-1 text-body text-error">
              {fieldErrors.category}
            </p>
          )}

          <input
            name="title"
            placeholder="Tiêu đề bài viết"
            defaultValue={initial?.title}
            aria-label="Tiêu đề"
            aria-invalid={fieldErrors.title ? true : undefined}
            aria-describedby={fieldErrors.title ? "tin-tuc-title-error" : undefined}
            className={`${wysiwygInput} mt-3 text-h2-mobile text-ink desktop:text-h1`}
          />
          {fieldErrors.title && (
            <p id="tin-tuc-title-error" className="mt-1 text-body text-error">
              {fieldErrors.title}
            </p>
          )}

          <p className="mt-3 text-body text-muted">Ngày đăng được tính tự động khi xuất bản — không cần nhập.</p>

          {/* Keep the current preview visible while a replacement uploads, so
              a failed upload never removes the image already attached. */}
          <div className="mt-6">
            <span className="text-label text-ink">Ảnh bìa (16:9)</span>
            <div className="mt-2 max-w-xl">
              {cover ? (
                <div className="group relative aspect-video overflow-hidden rounded-md">
                  <Image src={cover} alt="Ảnh bìa bài viết" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={removeCover}
                    disabled={uploaderState === "uploading"}
                    aria-label="Gỡ ảnh bìa"
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors duration-fast ease-base hover:bg-error disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Icon name="close" size={14} />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploaderState === "uploading"}
                      aria-label="Thay ảnh bìa"
                      className="flex items-center gap-2 rounded-md bg-surface px-4 py-2 text-label text-ink shadow-lg transition-colors duration-fast ease-base hover:bg-soft disabled:cursor-wait disabled:opacity-80"
                    >
                      <Icon name="upload" size={16} />
                      {uploaderState === "uploading" ? "Đang tải ảnh..." : "Thay ảnh"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="aspect-video">
                  <Uploader
                    state={uploaderState}
                    onClick={() => fileInputRef.current?.click()}
                    errorMessage={uploadError}
                    onRetry={() => {
                      setUploadError(undefined);
                      setUploaderState("empty");
                      fileInputRef.current?.click();
                    }}
                  />
                </div>
              )}
            </div>
            {cover && uploaderState === "error" && (
              <div
                role="alert"
                className="mt-2 flex max-w-xl flex-wrap items-center justify-between gap-2 rounded-md border border-error bg-[#FDF1F1] px-3 py-2 text-body text-error"
              >
                <span>{uploadError}</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-md border border-error px-3 py-1 text-label transition-colors duration-fast ease-base hover:bg-surface"
                >
                  Thử lại
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
              onChange={handleFileChange}
            />
            <p className="mt-2 text-body text-muted">
              Chưa có ảnh thì bài viết vẫn đăng được — website hiển thị ảnh placeholder thay vì ảnh của bài khác.
            </p>
          </div>

          <div className="mt-6">
            <label htmlFor="tin-tuc-excerpt" className="text-label text-ink">
              Mô tả ngắn (hiện ở thẻ bài viết ngoài danh sách)
            </label>
            <textarea
              id="tin-tuc-excerpt"
              name="excerpt"
              rows={3}
              placeholder="Tóm tắt 1-2 câu..."
              defaultValue={initial?.excerpt}
              className={`${wysiwygInput} mt-2 resize-none rounded-md border border-line p-3 text-body-lg-mobile text-body hover:border-line focus:border-primary`}
            />
          </div>
        </div>

        {/* Body — real, editable sections. This is the block that simply did
            not exist before. */}
        <div className="border-t border-line px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-h3 text-ink">Nội dung bài viết</p>
              <p className="text-body text-muted">
                Mỗi đoạn gồm 1 tiêu đề phụ (H2 trên website) và phần nội dung. Xuống dòng trong ô nội dung sẽ giữ
                nguyên khi hiển thị.
              </p>
            </div>
            <button
              type="button"
              onClick={addSection}
              className="rounded-md border border-primary px-4 py-2 text-label uppercase text-primary transition-colors duration-fast ease-base hover:bg-soft"
            >
              + Thêm đoạn
            </button>
          </div>

          {fieldErrors.sections && (
            <p role="alert" className="mt-3 text-body text-error">
              {fieldErrors.sections}
            </p>
          )}

          <div className="mt-4 flex flex-col gap-4">
            {sections.map((section, i) => (
              <div key={i} className="rounded-md border border-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <input
                    value={section.heading}
                    onChange={(e) => updateSection(i, { heading: e.target.value })}
                    placeholder={`Tiêu đề đoạn ${i + 1}`}
                    aria-label={`Tiêu đề đoạn ${i + 1}`}
                    className={`${wysiwygInput} text-h3 text-ink`}
                  />
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => moveSection(i, -1)}
                      disabled={i === 0}
                      aria-label={`Chuyển đoạn ${i + 1} lên trên`}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-muted transition-colors duration-fast ease-base hover:border-primary hover:text-primary disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(i, 1)}
                      disabled={i === sections.length - 1}
                      aria-label={`Chuyển đoạn ${i + 1} xuống dưới`}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-muted transition-colors duration-fast ease-base hover:border-primary hover:text-primary disabled:opacity-40"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSection(i)}
                      aria-label={`Xóa đoạn ${i + 1}`}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-muted transition-colors duration-fast ease-base hover:border-error hover:text-error"
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
                <textarea
                  value={section.body}
                  onChange={(e) => updateSection(i, { body: e.target.value })}
                  rows={5}
                  placeholder="Nội dung đoạn..."
                  aria-label={`Nội dung đoạn ${i + 1}`}
                  className={`${wysiwygInput} mt-3 resize-y text-body-lg-mobile text-body desktop:text-body-lg`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </form>
  );
}
