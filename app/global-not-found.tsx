import type { Metadata } from "next";
import Link from "next/link";
import { buildNotFoundMetadata } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = buildNotFoundMetadata("Không tìm thấy trang | NDTHICH LAND");

export default function GlobalNotFoundPage() {
  return (
    <html lang="vi">
      <body>
        <main className="container-page flex min-h-screen flex-col items-center justify-center px-4 py-20 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Lỗi 404</p>
          <h1 className="mt-3 text-h1-mobile text-ink desktop:text-h1">Không tìm thấy trang</h1>
          <p className="mt-4 max-w-xl text-body text-muted">
            Nội dung có thể đã được chuyển, ngừng xuất bản hoặc đường dẫn chưa chính xác.
          </p>
          <Link className="mt-8 rounded-md bg-primary px-6 py-3 font-bold text-white" href="/">
            Về trang chủ
          </Link>
        </main>
      </body>
    </html>
  );
}
