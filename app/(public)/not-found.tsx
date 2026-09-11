import Link from "next/link";

/** Reached by notFound() from /tin-tuc/[slug]. */
export default function PublicNotFound() {
  return (
    <div className="container-page py-16 text-center">
      <p className="text-label text-primary">404</p>
      <h1 className="mt-2 text-h1-mobile text-ink desktop:text-h1">Không tìm thấy nội dung này</h1>
      <p className="mx-auto mt-3 max-w-md text-body text-muted">
        Bài viết có thể đã được gỡ hoặc đổi đường dẫn.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/tin-tuc"
          className="rounded-md bg-primary px-6 py-3 text-button uppercase text-surface transition-colors duration-fast ease-base hover:bg-primaryHover"
        >
          Xem tất cả tin tức
        </Link>
        <Link
          href="/"
          className="rounded-md border border-primary px-6 py-3 text-button uppercase text-primary transition-colors duration-fast ease-base hover:bg-soft"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
