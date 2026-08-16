"use client";

import { useId, useState, type FormEvent } from "react";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";
import { submitContactAction } from "@/app/actions/contact";

interface ProjectInquiryForm2Props {
  projectName: string;
  variant?: "panel" | "inline";
  /** Overrides the "need" line written to WEB_CONTACTS — lets the same form
      serve a viewing request as well as a project consultation. */
  need?: string;
  submitLabel?: string;
}

// Routes through the existing approved WEB_CONTACTS backend
// (submitContactAction) — the freeze package's interaction rules forbid
// creating a new Leads/Viewing persistence flow for a visual control alone,
// so this reuses the same already-approved contact channel the public
// /lien-he form uses, tagging the project name into the message for context.
export function ProjectInquiryForm2({
  projectName,
  variant = "panel",
  need,
  submitLabel,
}: ProjectInquiryForm2Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string>();
  const errorId = useId();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Vui lòng nhập họ tên và số điện thoại.");
      return;
    }
    setError(undefined);
    setSubmitting(true);
    try {
      const result = await submitContactAction({
        name: name.trim(),
        phone: phone.trim(),
        need: need ?? `Tư vấn dự án: ${projectName}`,
        area: "",
        message: email.trim() ? `Email: ${email.trim()}` : "",
        website: "",
      });
      if (!result.ok) {
        setError(result.error ?? "Không gửi được yêu cầu. Vui lòng thử lại sau.");
        return;
      }
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  const isPanel = variant === "panel";

  if (submitted) {
    return (
      <div
        role="status"
        className={`rounded-lg p-5 text-[13px] ${isPanel ? "border border-[#EDEBEA] bg-white text-[#0C0D0D]" : "bg-white/10 text-white"}`}
      >
        Đã gửi yêu cầu tư vấn. NDTHICH sẽ liên hệ lại sớm nhất.
      </div>
    );
  }

  const inputClass = isPanel
    ? "w-full min-w-0 rounded-md border border-[#E4E1E0] px-2 py-2 text-[11px] text-[#0C0D0D] placeholder:text-[#A6A6A6] min-[900px]:px-[14px] min-[900px]:py-3 min-[900px]:text-[13px] wide:h-[52px] wide:px-4 wide:text-[15px]"
    : "w-full min-w-0 rounded-md border border-white/30 bg-white/10 px-2 py-2 text-[11px] text-white placeholder:text-white/70 min-[900px]:px-[14px] min-[900px]:py-3 min-[900px]:text-[13px] wide:h-[52px] wide:px-4 wide:text-[15px]";

  return (
    // Master's MOBILE form pairs Họ và tên / Số điện thoại on ONE row (not
    // each field as its own full-width block); the WEB master's panel is a
    // narrow single column instead, so each field stacks full-width there.
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2 min-[900px]:gap-3">
      <div className="grid grid-cols-2 gap-2 min-[900px]:grid-cols-1">
        {/* aria-label, not placeholder-only labelling: the placeholder is the
            only visible label here by design, and it disappears on typing. */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Họ và tên*"
          aria-label="Họ và tên"
          autoComplete="name"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={inputClass}
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Số điện thoại*"
          aria-label="Số điện thoại"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={inputClass}
        />
      </div>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        aria-label="Email (không bắt buộc)"
        type="email"
        autoComplete="email"
        className={inputClass}
      />
      {error && (
        <p id={errorId} role="alert" className={`text-[10px] min-[900px]:text-[12px] ${isPanel ? "text-[#C43D45]" : "text-white"}`}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className={`mt-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-[11px] font-semibold uppercase disabled:opacity-60 min-[900px]:px-5 min-[900px]:py-3 min-[900px]:text-[13px] wide:h-[52px] wide:rounded-[10px] wide:text-[15px] ${
          isPanel ? "bg-[#880206] text-white hover:bg-[#750F0D]" : "bg-white text-[#880206]"
        }`}
      >
        {submitting ? "Đang gửi..." : (submitLabel ?? (isPanel ? "Gửi thông tin" : "Nhận tư vấn miễn phí"))}
        <Icon name="arrow-right" size={13} className={isPanel ? "text-white" : ""} />
      </button>
    </form>
  );
}
