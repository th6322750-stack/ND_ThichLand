import Image from "next/image";
import Link from "next/link";

const columns = [
  {
    title: "CHO THUÊ",
    links: [
      { label: "Căn hộ dịch vụ", href: "/cho-thue" },
      { label: "Nhà cho thuê", href: "/cho-thue" },
      { label: "Mặt bằng / văn phòng", href: "/cho-thue" },
      { label: "Phòng / studio", href: "/cho-thue" },
    ],
  },
  {
    title: "DỰ ÁN",
    links: [
      { label: "Dự án tiêu biểu", href: "/du-an" },
      { label: "Tiến độ", href: "/du-an" },
      { label: "Tư vấn dự án", href: "/du-an" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-footer text-surface">
      <div className="container-page grid grid-cols-1 gap-10 py-16 tablet:grid-cols-2 desktop:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/assets/logos/NO_LOGO.svg" alt="NDTHICH LAND" width={36} height={36} unoptimized />
            <span className="text-h3 text-surface">NDTHICH LAND</span>
          </div>
          <p className="mt-4 text-body text-[#B9B9B9]">Bất động sản cho thuê và dự án công ty</p>
          <p className="mt-1 text-body text-[#B9B9B9]">Đầu tư uy tín • Kinh doanh bền vững</p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-label text-[#B9B9B9]">{col.title}</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-body text-surface hover:text-gold">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="text-label text-[#B9B9B9]">LIÊN HỆ</h3>
          <ul className="mt-4 flex flex-col gap-3 text-body text-surface">
            <li>
              <a href="tel:0986602203">0986 602 203</a>
            </li>
            <li>
              <a href="tel:0985551396">0985 551 396</a>
            </li>
            <li>Hà Nội</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#2B2B2B]">
        <div className="container-page py-6 text-body text-[#8C8C8C]">
          © 2026 Công ty TNHH Đầu tư &amp; Kinh doanh Nguyễn Đắc Thích
        </div>
      </div>
    </footer>
  );
}
