import Link from "next/link";

/**
 * Reached by notFound() from /cho-thue/[slug] and /du-an/[slug] — a stale or
 * mistyped link previously fell through to the framework default with no
 * header/footer and no way back into the catalogue.
 */
export default function PublicV2NotFound() {
  return (
    <div className="v2-container py-16 text-center">
      <p className="text-[13px] font-bold uppercase tracking-wide text-[#880206]">404</p>
      <h1 className="mt-2 text-[20px] font-extrabold text-[#0C0D0D] min-[900px]:text-[28px]">
        Không tìm thấy nội dung này
      </h1>
      <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-[#5F5D5D]">
        Tin đăng có thể đã được cho thuê hoặc gỡ khỏi danh sách. Anh/chị xem các bất động sản và dự án đang có
        bên dưới nhé.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/cho-thue"
          className="rounded-md bg-[#880206] px-5 py-3 text-[13px] font-semibold text-white transition-colors duration-fast ease-base hover:bg-[#750F0D]"
        >
          Xem BĐS cho thuê
        </Link>
        <Link
          href="/du-an"
          className="rounded-md border border-[#880206] px-5 py-3 text-[13px] font-semibold text-[#880206] transition-colors duration-fast ease-base hover:bg-[#F7F6F6]"
        >
          Xem dự án
        </Link>
      </div>
    </div>
  );
}
