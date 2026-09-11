"use client";

import { useRef, useState, type FormEvent } from "react";
import { FormField } from "@/components/public/FormField";
import { submitContactAction } from "@/app/actions/contact";

interface FieldErrors {
  name?: string;
  phone?: string;
}

interface ContactFormProps {
  nameLabel?: string;
  phoneLabel?: string;
  needLabel?: string;
  needPlaceholder?: string;
  areaLabel?: string;
  areaPlaceholder?: string;
  messageLabel?: string;
  submitLabel?: string;
  submittingLabel?: string;
  nameRequiredError?: string;
  phoneRequiredError?: string;
  successMessage?: string;
}

export function ContactForm({
  nameLabel = "Họ và tên",
  phoneLabel = "Số điện thoại",
  needLabel = "Nhu cầu",
  needPlaceholder = "Thuê / dự án / tư vấn chung",
  areaLabel = "Khu vực quan tâm",
  areaPlaceholder = "Hà Nội...",
  messageLabel = "Nội dung",
  submitLabel = "Gửi yêu cầu",
  submittingLabel = "Đang gửi...",
  nameRequiredError = "Vui lòng nhập họ và tên",
  phoneRequiredError = "Vui lòng nhập số điện thoại",
  successMessage = "Đã gửi yêu cầu tư vấn. NDTHICH sẽ liên hệ lại sớm nhất.",
}: ContactFormProps = {}) {
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();

    const nextErrors: FieldErrors = {};
    if (!name) nextErrors.name = nameRequiredError;
    if (!phone) nextErrors.phone = phoneRequiredError;

    setErrors(nextErrors);
    setFormError(undefined);

    if (nextErrors.name) {
      nameRef.current?.focus();
      return;
    }
    if (nextErrors.phone) {
      phoneRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitContactAction({
        name,
        phone,
        need: String(form.get("need") ?? "").trim(),
        area: String(form.get("area") ?? "").trim(),
        message: String(form.get("message") ?? "").trim(),
        website: String(form.get("website") ?? ""),
      });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.error);
        return;
      }
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-md border border-success bg-soft p-6 text-body text-ink" role="status">
        {successMessage}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2">
        <FormField ref={nameRef} label={nameLabel} name="name" required error={errors.name} />
        <FormField ref={phoneRef} label={phoneLabel} name="phone" type="tel" required error={errors.phone} />
        <FormField label={needLabel} name="need" placeholder={needPlaceholder} />
        <FormField label={areaLabel} name="area" placeholder={areaPlaceholder} />
      </div>
      <div className="mt-6">
        <FormField label={messageLabel} name="message" type="textarea" />
      </div>
      {/* Honeypot: visually hidden, off-screen rather than display:none so
          it still registers as "filled" if a bot's CSS-blind script tabs
          through and fills every input; real users never see or reach it. */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="h-0 w-0"
        />
      </div>
      {formError && (
        <p role="alert" className="mt-4 text-body text-error">
          {formError}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="mt-6 rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover disabled:opacity-60"
      >
        {submitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}
