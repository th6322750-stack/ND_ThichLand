"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icons";
import { submitContactAction } from "@/app/actions/contact";

interface ProjectInquiryForm2Props {
  projectName: string;
  variant?: "panel" | "inline";
}

// Routes through the existing approved WEB_CONTACTS backend
// (submitContactAction) — the freeze package's interaction rules forbid
// creating a new Leads/Viewing persistence flow for a visual control alone,
// so this reuses the same already-approved contact channel the public
// /lien-he form uses, tagging the project name into the message for context.
export function ProjectInquiryForm2({ projectName, variant = "panel" }: ProjectInquiryForm2Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string>();

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
        need: `Tư vấn dự án: ${projectName}`,
        area: "",
        message: [email.trim() && `Email: ${email.trim()}`, message.trim()].filter(Boolean).join(" — "),
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
    ? "w-full rounded-md border border-[#E4E1E0] px-3.5 py-3 text-[13px] text-[#0C0D0D] placeholder:text-[#A6A6A6]"
    : "w-full rounded-md border border-white/30 bg-white/10 px-3.5 py-3 text-[13px] text-white placeholder:text-white/70";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ và tên*" className={inputClass} />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại*" className={inputClass} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className={inputClass} />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Nội dung"
        rows={3}
        className={inputClass}
      />
      {error && (
        <p role="alert" className={`text-[12px] ${isPanel ? "text-[#C43D45]" : "text-white"}`}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className={`mt-1 flex items-center justify-center gap-2 rounded-md px-5 py-3 text-[13px] font-semibold uppercase disabled:opacity-60 ${
          isPanel ? "bg-[#880206] text-white hover:bg-[#750F0D]" : "bg-white text-[#880206]"
        }`}
      >
        {submitting ? "Đang gửi..." : isPanel ? "Gửi thông tin" : "Nhận tư vấn miễn phí"}
        <Icon name="arrow-right" size={14} className={isPanel ? "invert" : ""} />
      </button>
    </form>
  );
}
