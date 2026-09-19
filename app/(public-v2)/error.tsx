"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * A Sheets/Drive read that throws used to surface Next.js's bare default
 * error screen. This keeps the visitor inside the site chrome, gives them a
 * retry and a way out, and never prints the underlying exception (it can
 * carry provider/internal details).
 */
export default function PublicV2Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Server-side detail stays server-side; the digest is the safe handle for
    // correlating this render with the server log.
    console.error("public-v2 route error", error.digest);
  }, [error]);

  return (
    <div className="v2-container py-16 text-center">
      <h1 className="text-[20px] font-extrabold text-[#0C0D0D] min-[900px]:text-[28px]">
        Không tải được nội dung
      </h1>
      <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-[#5F5D5D]">
        Hệ thống đang tạm thời không lấy được dữ liệu. Anh/chị thử tải lại giúp, hoặc gọi hotline để được hỗ trợ
        ngay.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-[#880206] px-5 py-3 text-[13px] font-semibold text-white transition-colors duration-fast ease-base hover:bg-[#750F0D]"
        >
          Thử lại
        </button>
        <Link
          href="/"
          className="rounded-md border border-[#880206] px-5 py-3 text-[13px] font-semibold text-[#880206] transition-colors duration-fast ease-base hover:bg-[#F7F6F6]"
        >
          Về trang chủ
        </Link>
        <a
          href="tel:0986602203"
          className="rounded-md border border-[#E4E1E0] px-5 py-3 text-[13px] font-semibold text-[#0C0D0D] transition-colors duration-fast ease-base hover:border-[#880206]"
        >
          Gọi 0986 602 203
        </a>
      </div>
      {error.digest && <p className="mt-6 text-[11px] text-[#A6A6A6]">Mã lỗi: {error.digest}</p>}
    </div>
  );
}
