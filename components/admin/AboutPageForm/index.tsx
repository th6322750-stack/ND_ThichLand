"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveAboutPageContentAction } from "@/app/actions/pageContent";
import { FormField } from "@/components/public/FormField";
import { FormSection } from "@/components/admin/FormSection";
import { PageHeader } from "@/components/admin/PageHeader";
import { PageImageField } from "@/components/admin/PageImageField";
import type { AboutPageContent } from "@/lib/types";

function read(form: FormData, name: string): string {
  return String(form.get(name) ?? "");
}

export function AboutPageForm({ initial }: { initial: AboutPageContent }) {
  const router = useRouter();
  const [heroImage, setHeroImage] = useState(initial.heroImage);
  const [areaImages, setAreaImages] = useState(initial.areas.map((area) => area.image));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(undefined);
    setFieldErrors({});
    try {
      const form = new FormData(event.currentTarget);
      const input: AboutPageContent = {
        metadataTitle: read(form, "metadataTitle"),
        metadataDescription: read(form, "metadataDescription"),
        heroEyebrow: read(form, "heroEyebrow"),
        heroTitle: read(form, "heroTitle"),
        heroBody: read(form, "heroBody"),
        heroImage,
        heroMediaLabel: read(form, "heroMediaLabel"),
        statsEyebrow: read(form, "statsEyebrow"),
        statsTitle: read(form, "statsTitle"),
        statsDescription: read(form, "statsDescription"),
        stats: initial.stats.map((_, index) => ({
          value: read(form, `stats.${index}.value`),
          label: read(form, `stats.${index}.label`),
        })),
        valuesEyebrow: read(form, "valuesEyebrow"),
        valuesTitle: read(form, "valuesTitle"),
        values: initial.values.map((_, index) => ({
          title: read(form, `values.${index}.title`),
          body: read(form, `values.${index}.body`),
        })),
        areasEyebrow: read(form, "areasEyebrow"),
        areasTitle: read(form, "areasTitle"),
        areasDescription: read(form, "areasDescription"),
        areas: initial.areas.map((_, index) => ({
          title: read(form, `areas.${index}.title`),
          description: read(form, `areas.${index}.description`),
          image: areaImages[index] ?? "",
        })),
        ctaTitle: read(form, "ctaTitle"),
        ctaSubtitle: read(form, "ctaSubtitle"),
        ctaCallLabel: read(form, "ctaCallLabel"),
        ctaZaloLabel: read(form, "ctaZaloLabel"),
      };
      const result = await saveAboutPageContentAction(input);
      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <PageHeader
        title="Chỉnh sửa trang Về chúng tôi"
        description="Các nhóm bên dưới đi theo đúng thứ tự đang hiển thị trên /gioi-thieu."
        action={
          <>
            <Link href="/gioi-thieu" target="_blank" className="inline-flex min-h-[44px] items-center rounded-sm border border-line px-4 text-label text-ink hover:border-primary hover:text-primary">
              Xem website ↗
            </Link>
            <button type="submit" disabled={saving} className="min-h-[44px] rounded-sm bg-primary px-6 text-button uppercase text-surface hover:bg-primaryHover disabled:opacity-60">
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </>
        }
      />

      {error && <p role="alert" className="rounded-md border border-error bg-error/5 p-4 text-body text-error">{error}</p>}
      {saved && <p role="status" className="rounded-md border border-success bg-success/5 p-4 text-body text-success">Đã lưu và cập nhật trang Về chúng tôi.</p>}

      <FormSection title="SEO & chia sẻ liên kết">
        <FormField label="Tiêu đề SEO" name="metadataTitle" required defaultValue={initial.metadataTitle} error={fieldErrors.metadataTitle} maxLength={160} />
        <FormField label="Mô tả SEO" name="metadataDescription" type="textarea" required defaultValue={initial.metadataDescription} error={fieldErrors.metadataDescription} />
      </FormSection>

      <FormSection title="1. Khối mở đầu">
        <FormField label="Nhãn nhỏ" name="heroEyebrow" required defaultValue={initial.heroEyebrow} error={fieldErrors.heroEyebrow} />
        <FormField label="Tiêu đề chính" name="heroTitle" type="textarea" required defaultValue={initial.heroTitle} error={fieldErrors.heroTitle} hint="Xuống dòng trong ô sẽ được giữ nguyên ngoài website." />
        <FormField label="Nội dung giới thiệu" name="heroBody" type="textarea" required defaultValue={initial.heroBody} error={fieldErrors.heroBody} />
        <FormField label="Chú thích ảnh" name="heroMediaLabel" required defaultValue={initial.heroMediaLabel} error={fieldErrors.heroMediaLabel} />
        <PageImageField label="Ảnh khối mở đầu" value={heroImage} onChange={setHeroImage} error={fieldErrors.heroImage} hint="Khuyến nghị ảnh ngang 4:3 hoặc 16:9, tối đa 8MB." />
      </FormSection>

      <FormSection title="2. Năng lực / số liệu">
        <FormField label="Nhãn nhỏ" name="statsEyebrow" required defaultValue={initial.statsEyebrow} error={fieldErrors.statsEyebrow} />
        <FormField label="Tiêu đề" name="statsTitle" required defaultValue={initial.statsTitle} error={fieldErrors.statsTitle} />
        <div className="min-[1200px]:col-span-2"><FormField label="Mô tả" name="statsDescription" required defaultValue={initial.statsDescription} error={fieldErrors.statsDescription} /></div>
        {initial.stats.map((item, index) => (
          <div key={index} className="grid gap-4 rounded-md border border-line p-4 min-[1200px]:grid-cols-2">
            <FormField label={`Số liệu ${index + 1}`} name={`stats.${index}.value`} required defaultValue={item.value} error={fieldErrors[`stats.${index}.value`]} />
            <FormField label="Nhãn" name={`stats.${index}.label`} required defaultValue={item.label} error={fieldErrors[`stats.${index}.label`]} />
          </div>
        ))}
      </FormSection>

      <FormSection title="3. Giá trị cốt lõi">
        <FormField label="Nhãn nhỏ" name="valuesEyebrow" required defaultValue={initial.valuesEyebrow} error={fieldErrors.valuesEyebrow} />
        <FormField label="Tiêu đề" name="valuesTitle" required defaultValue={initial.valuesTitle} error={fieldErrors.valuesTitle} />
        {initial.values.map((item, index) => (
          <div key={index} className="rounded-md border border-line p-4">
            <FormField label={`Giá trị ${index + 1}`} name={`values.${index}.title`} required defaultValue={item.title} error={fieldErrors[`values.${index}.title`]} />
            <div className="mt-4"><FormField label="Mô tả" name={`values.${index}.body`} type="textarea" required defaultValue={item.body} error={fieldErrors[`values.${index}.body`]} /></div>
          </div>
        ))}
      </FormSection>

      <FormSection title="4. Lĩnh vực hoạt động">
        <FormField label="Nhãn nhỏ" name="areasEyebrow" required defaultValue={initial.areasEyebrow} error={fieldErrors.areasEyebrow} />
        <FormField label="Tiêu đề" name="areasTitle" required defaultValue={initial.areasTitle} error={fieldErrors.areasTitle} />
        <div className="min-[1200px]:col-span-2"><FormField label="Mô tả chung" name="areasDescription" required defaultValue={initial.areasDescription} error={fieldErrors.areasDescription} /></div>
        {initial.areas.map((item, index) => (
          <div key={index} className="min-[1200px]:col-span-2 grid gap-4 rounded-md border border-line p-4 min-[1200px]:grid-cols-2">
            <FormField label={`Tên lĩnh vực ${index + 1}`} name={`areas.${index}.title`} required defaultValue={item.title} error={fieldErrors[`areas.${index}.title`]} />
            <FormField label="Mô tả" name={`areas.${index}.description`} required defaultValue={item.description} error={fieldErrors[`areas.${index}.description`]} />
            <PageImageField label={`Ảnh lĩnh vực ${index + 1}`} value={areaImages[index] ?? ""} onChange={(value) => setAreaImages((current) => current.map((image, imageIndex) => imageIndex === index ? value : image))} error={fieldErrors[`areas.${index}.image`]} />
          </div>
        ))}
      </FormSection>

      <FormSection title="5. Kêu gọi liên hệ">
        <FormField label="Tiêu đề" name="ctaTitle" required defaultValue={initial.ctaTitle} error={fieldErrors.ctaTitle} />
        <FormField label="Mô tả" name="ctaSubtitle" required defaultValue={initial.ctaSubtitle} error={fieldErrors.ctaSubtitle} />
        <FormField label="Chữ trên nút gọi" name="ctaCallLabel" required defaultValue={initial.ctaCallLabel} error={fieldErrors.ctaCallLabel} />
        <FormField label="Chữ trên nút Zalo" name="ctaZaloLabel" required defaultValue={initial.ctaZaloLabel} error={fieldErrors.ctaZaloLabel} />
      </FormSection>
    </form>
  );
}
