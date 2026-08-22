"use client";

import { useState } from "react";

interface PublicShareButtonProps {
  publicPath: string;
  title: string;
  disabled?: boolean;
}

async function copyLink(url: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = url;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Copy command failed");
}

export function PublicShareButton({ publicPath, title, disabled = false }: PublicShareButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  async function handleShare() {
    const url = new URL(publicPath, window.location.origin).toString();
    setState("idle");

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if ((error as { name?: string })?.name === "AbortError") return;
      }
    }

    try {
      await copyLink(url);
      setState("copied");
    } catch {
      setState("error");
    }
  }

  const label = state === "copied" ? "Đã sao chép" : state === "error" ? "Không thể sao chép" : "Chia sẻ";

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={disabled}
      title={disabled ? "Cần xuất bản trước khi chia sẻ" : "Chia sẻ liên kết công khai"}
      aria-label={disabled ? `Chưa thể chia sẻ ${title}: cần xuất bản trước` : `Chia sẻ ${title}`}
      className="text-label text-ink transition-colors duration-fast ease-base hover:text-primary disabled:cursor-not-allowed disabled:text-muted disabled:opacity-50"
    >
      <span aria-live={state === "idle" ? undefined : "polite"}>{label}</span>
    </button>
  );
}
