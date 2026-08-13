"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/public/FormField";
import { Icon } from "@/components/icons";
import { saveProjectAction, type ProjectFormInput } from "@/app/actions/projects";
import type { ProjectRecord } from "@/lib/server/projects/repository";
import type { ProjectStatus } from "@/lib/types";

interface DuAnFormProps {
  initial?: ProjectRecord;
}

export function DuAnForm({ initial }: DuAnFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string>();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(undefined);
    setSaved(undefined);
    try {
      const data = new FormData(e.currentTarget);
      const get = (name: string) => String(data.get(name) ?? "").trim();
      const progressMatch = get("progress").match(/(\d+)\s*%/);

      const input: ProjectFormInput = {
        slug: initial?.slug ?? "",
        name: get("name"),
        location: get("location"),
        investor: get("investor"),
        status: (get("status") || initial?.status || "Đang triển khai") as ProjectStatus,
        summary: get("summary"),
        amenities: get("amenities")
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        progressText: get("progress"),
        progressPercent: progressMatch ? Number(progressMatch[1]) : (initial?.progressPercent ?? 0),
        media: initial?.media ?? [],
      };

      const result = await saveProjectAction(input, true);
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        setError(result.error);
        return;
      }
      setFieldErrors({});
      setSaved("Đã lưu dự án.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-admin-title-mobile text-ink desktop:text-admin-title">Thêm / sửa dự án</h1>
          <p className="mt-1 text-body text-muted">Các field đúng scope dự án đã khảo sát.</p>
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
        <h2 className="text-h3 text-ink">Thông tin dự án</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 min-[1200px]:grid-cols-2">
          <FormField label="Tên dự án" name="name" required defaultValue={initial?.name} error={fieldErrors.name} />
          <FormField
            label="Vị trí"
            name="location"
            required
            defaultValue={initial?.location}
            error={fieldErrors.location}
          />
          <FormField label="Chủ đầu tư" name="investor" required defaultValue={initial?.investor} />
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
            defaultValue={initial?.progressText || (initial ? `${initial.progressPercent}% hoàn thành` : undefined)}
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
