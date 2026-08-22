"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveContactPageContentAction } from "@/app/actions/pageContent";
import { FormField } from "@/components/public/FormField";
import { FormSection } from "@/components/admin/FormSection";
import { PageHeader } from "@/components/admin/PageHeader";
import type { ContactPageContent } from "@/lib/types";

function read(form: FormData, name: keyof ContactPageContent): string {
  return String(form.get(name) ?? "");
}

export function ContactPageForm({ initial }: { initial: ContactPageContent }) {
  const router = useRouter();
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
      const input = Object.fromEntries(
        (Object.keys(initial) as (keyof ContactPageContent)[]).map((key) => [key, read(form, key)]),
      ) as unknown as ContactPageContent;
      const result = await saveContactPageContentAction(input);
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

  const field = (label: string, name: keyof ContactPageContent, options?: { textarea?: boolean; hint?: string; maxLength?: number }) => (
    <FormField
      label={label}
      name={name}
      type={options?.textarea ? "textarea" : "text"}
      required
      defaultValue={initial[name]}
      error={fieldErrors[name]}
      hint={options?.hint}
      maxLength={options?.maxLength}
    />
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <PageHeader
        title="Chỉnh sửa trang Liên hệ"
        description="Nội dung và nhãn bám đúng bố cục /lien-he; hotline, địa chỉ và bản đồ lấy từ Cài đặt chung."
        action={
          <>
            <Link href="/lien-he" target="_blank" className="inline-flex min-h-[44px] items-center rounded-sm border border-line px-4 text-label text-ink hover:border-primary hover:text-primary">Xem website ↗</Link>
            <button type="submit" disabled={saving} className="min-h-[44px] rounded-sm bg-primary px-6 text-button uppercase text-surface hover:bg-primaryHover disabled:opacity-60">{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
          </>
        }
      />

      {error && <p role="alert" className="rounded-md border border-error bg-error/5 p-4 text-body text-error">{error}</p>}
      {saved && <p role="status" className="rounded-md border border-success bg-success/5 p-4 text-body text-success">Đã lưu và cập nhật trang Liên hệ.</p>}

      <FormSection title="SEO & chia sẻ liên kết">
        {field("Tiêu đề SEO", "metadataTitle", { maxLength: 160 })}
        {field("Mô tả SEO", "metadataDescription", { textarea: true })}
      </FormSection>

      <FormSection title="1. Khối mở đầu & bản đồ">
        {field("Tiêu đề chính", "heroTitle")}
        {field("Nội dung giới thiệu", "heroBody", { textarea: true })}
        {field("Chữ trên nút gọi", "callButtonLabel")}
        {field("Chữ trên nút Zalo", "zaloButtonLabel")}
        <div className="min-[1200px]:col-span-2">{field("Nhãn bản đồ", "mapLabel", { hint: "Địa chỉ ghim bản đồ được chỉnh tại Cài đặt chung." })}</div>
      </FormSection>

      <FormSection title="2. Thẻ thông tin liên hệ">
        {field("Nhãn hotline chính", "primaryPhoneLabel")}
        {field("Nhãn hotline phụ", "secondaryPhoneLabel")}
        {field("Nhãn địa chỉ / khu vực", "locationLabel")}
      </FormSection>

      <FormSection title="3. Form yêu cầu tư vấn">
        {field("Tiêu đề form", "formTitle")}
        {field("Mô tả form", "formDescription", { textarea: true })}
        {field("Nhãn Họ và tên", "formNameLabel")}
        {field("Nhãn Số điện thoại", "formPhoneLabel")}
        {field("Nhãn Nhu cầu", "formNeedLabel")}
        {field("Gợi ý ô Nhu cầu", "formNeedPlaceholder")}
        {field("Nhãn Khu vực", "formAreaLabel")}
        {field("Gợi ý ô Khu vực", "formAreaPlaceholder")}
        {field("Nhãn Nội dung", "formMessageLabel")}
        {field("Chữ nút Gửi", "formSubmitLabel")}
        {field("Chữ khi đang gửi", "formSubmittingLabel")}
        {field("Lỗi khi thiếu Họ và tên", "formNameRequiredError")}
        {field("Lỗi khi thiếu Số điện thoại", "formPhoneRequiredError")}
        {field("Thông báo gửi thành công", "formSuccessMessage", { textarea: true })}
      </FormSection>
    </form>
  );
}
