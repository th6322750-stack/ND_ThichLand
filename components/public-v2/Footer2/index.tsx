import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons";

const HOTLINE_LABEL = "0984 602 303 - 0989 811 396";
const HOTLINE_TEL = "0984602303";

const QUICK_LINKS = [
  { label: "Trang chủ", href: "/" },
  { label: "Cho thuê", href: "/cho-thue" },
  { label: "Dự án", href: "/du-an" },
  { label: "Về chúng tôi", href: "/gioi-thieu" },
  { label: "Tin tức", href: "/tin-tuc" },
  { label: "Liên hệ", href: "/lien-he" },
];

const PROPERTY_TYPES = ["Căn hộ", "Nhà nguyên căn", "Mặt bằng kinh doanh", "Văn phòng", "Kho xưởng", "Đất nền"];

const SOCIALS: { name: "facebook" | "youtube" | "chat" | "tiktok"; href: string; label: string }[] = [
  { name: "facebook", href: "#", label: "Facebook" },
  { name: "youtube", href: "#", label: "YouTube" },
  { name: "chat", href: "#", label: "Zalo" },
  { name: "tiktok", href: "#", label: "TikTok" },
];

export function Footer2() {
  return (
    <footer className="bg-[#1C1F1E] text-white">
      <div className="mx-auto max-w-[1240px] px-4 py-12 min-[900px]:px-10">
        <div className="grid grid-cols-1 gap-10 min-[900px]:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Image
              src="/assets/v2/branding/ndthich-logo-reference.png"
              alt="NDTHICH"
              width={168}
              height={128}
              className="h-10 w-auto"
              unoptimized
            />
            <p className="mt-4 text-[13px] font-bold uppercase tracking-wide text-white">
              Công ty TNHH MTV Nguyễn Đắc Thích
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[#A6A6A6]">
              Chuyên cho thuê nhà, căn hộ, mặt bằng kinh doanh tại các vị trí đắc địa. Pháp lý rõ ràng,
              hỗ trợ tận tâm.
            </p>
            <div className="mt-4 flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-[#880206]"
                >
                  <Icon name={s.name} size={16} className="invert" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-wide text-white">Quick Links</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13px] text-[#A6A6A6] hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-wide text-white">Loại hình</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {PROPERTY_TYPES.map((t) => (
                <li key={t}>
                  <Link href="/cho-thue" className="text-[13px] text-[#A6A6A6] hover:text-white">
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-wide text-white">Thông tin liên hệ</h3>
            <ul className="mt-4 flex flex-col gap-3 text-[13px] text-[#A6A6A6]">
              <li className="flex items-start gap-2">
                <Icon name="pin" size={16} className="mt-0.5 shrink-0 invert" />
                <span>120 Nguyễn Xí, Phường 26, Quận Bình Thạnh, TP. HCM</span>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="phone" size={16} className="shrink-0 invert" />
                <a href={`tel:${HOTLINE_TEL}`} className="hover:text-white">
                  {HOTLINE_LABEL}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="chat" size={16} className="shrink-0 invert" />
                <a href="mailto:info@ndthich.com.vn" className="hover:text-white">
                  info@ndthich.com.vn
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="clock" size={16} className="mt-0.5 shrink-0 invert" />
                <span>
                  Thứ 2 - Thứ 7: 8:00 - 18:00
                  <br />
                  Chủ nhật: 8:00 - 12:00
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-[#880206]">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-2 px-4 py-4 text-[12px] text-white/90 min-[900px]:flex-row min-[900px]:px-10">
          <span>© 2026 Nguyễn Đắc Thích. All rights reserved.</span>
          <span>Thiết kế bởi NDTHICH</span>
        </div>
      </div>
    </footer>
  );
}
