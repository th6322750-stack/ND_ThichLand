"use client";

import { useRef, useState, type FormEvent } from "react";
import { FormField } from "@/components/public/FormField";

interface FieldErrors {
  name?: string;
  phone?: string;
}

export function ContactForm() {
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();

    const nextErrors: FieldErrors = {};
    if (!name) nextErrors.name = "Vui lòng nhập họ và tên";
    if (!phone) nextErrors.phone = "Vui lòng nhập số điện thoại";

    setErrors(nextErrors);

    if (nextErrors.name) {
      nameRef.current?.focus();
      return;
    }
    if (nextErrors.phone) {
      phoneRef.current?.focus();
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-md border border-success bg-soft p-6 text-body text-ink" role="status">
        Đã gửi yêu cầu tư vấn. NDTHICH sẽ liên hệ lại sớm nhất.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2">
        <FormField ref={nameRef} label="Họ và tên" name="name" required error={errors.name} />
        <FormField ref={phoneRef} label="Số điện thoại" name="phone" type="tel" required error={errors.phone} />
        <FormField label="Nhu cầu" name="need" placeholder="Thuê / dự án / tư vấn chung" />
        <FormField label="Khu vực quan tâm" name="area" placeholder="Hà Nội..." />
      </div>
      <div className="mt-6">
        <FormField label="Nội dung" name="message" type="textarea" />
      </div>
      <button
        type="submit"
        className="mt-6 rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
      >
        Gửi yêu cầu
      </button>
    </form>
  );
}
