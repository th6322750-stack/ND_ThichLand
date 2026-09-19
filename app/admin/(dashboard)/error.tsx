"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * A Sheets read that throws inside the CMS used to drop the operator on the
 * bare framework error page with no navigation back. Never renders the raw
 * message — a provider exception can carry spreadsheet ids or credentials
 * detail.
 */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("admin route error", error.digest);
  }, [error]);

  return (
    <div className="rounded-md border border-line bg-surface p-8">
      <h2 className="text-h2-mobile text-ink desktop:text-h2">Không tải được dữ liệu</h2>
      <p className="mt-2 max-w-lg text-body text-muted">
        Không đọc được dữ liệu từ nguồn lưu trữ. Kiểm tra kết nối và cấu hình Google Sheets, sau đó thử lại.
        Không có thay đổi nào bị mất — thao tác lưu gần nhất của bạn không bị ảnh hưởng bởi lỗi đọc này.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-primary px-6 py-3 text-button uppercase text-surface transition-colors duration-fast ease-base hover:bg-primaryHover"
        >
          Thử lại
        </button>
        <Link
          href="/admin"
          className="rounded-md border border-primary px-6 py-3 text-button uppercase text-primary transition-colors duration-fast ease-base hover:bg-soft"
        >
          Về tổng quan
        </Link>
      </div>
      {error.digest && <p className="mt-6 text-body text-muted">Mã lỗi: {error.digest}</p>}
    </div>
  );
}
