"use client";

import { useEffect } from "react";
import Link from "next/link";

/** Same contract as the public-v2 boundary: honest message, a retry, a way
    out, and never the raw exception text. */
export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("public route error", error.digest);
  }, [error]);

  return (
    <div className="container-page py-16 text-center">
      <h1 className="text-h1-mobile text-ink desktop:text-h1">Không tải được nội dung</h1>
      <p className="mx-auto mt-3 max-w-md text-body text-muted">
        Hệ thống đang tạm thời không lấy được dữ liệu. Anh/chị thử tải lại giúp, hoặc gọi hotline để được hỗ trợ.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-primary px-6 py-3 text-button uppercase text-surface transition-colors duration-fast ease-base hover:bg-primaryHover"
        >
          Thử lại
        </button>
        <Link
          href="/"
          className="rounded-md border border-primary px-6 py-3 text-button uppercase text-primary transition-colors duration-fast ease-base hover:bg-soft"
        >
          Về trang chủ
        </Link>
      </div>
      {error.digest && <p className="mt-6 text-body text-muted">Mã lỗi: {error.digest}</p>}
    </div>
  );
}
