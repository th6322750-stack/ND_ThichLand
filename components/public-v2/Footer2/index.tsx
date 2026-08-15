"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";

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

// Master's mobile footer composition varies per route — Home shows a
// compact 3-column layout (brand | quick links | contact); /du-an's master
// shows only 2 columns (brand | contact, no Quick Links at all) with a
// shorter brand description and a plain "Liên hệ" heading instead of
// "Thông tin liên hệ". Every other route's mobile master scrolls off well
// before the footer, so those keep the default (Home's) composition.
// "Loại hình" is desktop-only everywhere — mobile never shows it.
export function Footer2() {
  const pathname = usePathname() ?? "";
  const compact = pathname === "/du-an";

  return (
    <footer className="bg-[#1C1F1E] text-white" data-qa-region="footer">
      <div className="mx-auto max-w-[1240px] px-3 py-1 min-[900px]:px-10 min-[900px]:py-1">
        <div
          className={`grid gap-1 min-[900px]:grid-cols-[1.4fr_1fr_1fr_1.2fr] min-[900px]:gap-3 ${compact ? "grid-cols-2" : "grid-cols-3"}`}
        >
          <div>
            <Image
              src="/assets/v2/branding/ndthich-logo-reference.png"
              alt="NDTHICH"
              width={168}
              height={128}
              className="h-5 w-auto min-[900px]:h-6"
              unoptimized
            />
            <p className="mt-1 text-[6px] font-bold uppercase tracking-wide text-white min-[900px]:mt-2 min-[900px]:text-[11px]">
              Công ty TNHH MTV Nguyễn Đắc Thích
            </p>
            <p className="mt-1 line-clamp-2 text-[6px] leading-tight text-[#A6A6A6] min-[900px]:mt-1 min-[900px]:text-[11px]">
              {compact
                ? "Chuyên cho thuê mặt bằng & kinh doanh bất động sản."
                : "Chuyên cho thuê nhà, căn hộ, mặt bằng kinh doanh tại các vị trí đắc địa. Pháp lý rõ ràng, hỗ trợ tận tâm."}
            </p>
            <div className="mt-1 flex items-center gap-1 min-[900px]:mt-2 min-[900px]:gap-1">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-white hover:bg-[#880206] min-[900px]:h-6 min-[900px]:w-6"
                >
                  <Icon name={s.name} size={8} className="text-white min-[900px]:!h-3 min-[900px]:!w-3" />
                </a>
              ))}
            </div>
          </div>

          <div className={compact ? "hidden min-[900px]:block" : ""}>
            <h3 className="text-[7px] font-bold uppercase tracking-wide text-white min-[900px]:text-[11px]">Quick Links</h3>
            <ul className="mt-1 flex flex-col gap-[2px] leading-tight min-[900px]:mt-2 min-[900px]:gap-[2px]">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[6px] text-[#A6A6A6] hover:text-white min-[900px]:text-[11px]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden min-[900px]:block">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-white">Loại hình</h3>
            <ul className="mt-2 flex flex-col gap-[2px] leading-tight">
              {PROPERTY_TYPES.map((t) => (
                <li key={t}>
                  <Link href="/cho-thue" className="text-[11px] text-[#A6A6A6] hover:text-white">
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[7px] font-bold uppercase tracking-wide text-white min-[900px]:text-[11px]">
              <span className={compact ? "min-[900px]:hidden" : "hidden"}>Liên hệ</span>
              <span className={compact ? "hidden min-[900px]:inline" : "inline"}>Thông tin liên hệ</span>
            </h3>
            <ul className="mt-1 flex flex-col gap-[2px] text-[6px] leading-tight text-[#A6A6A6] min-[900px]:mt-2 min-[900px]:gap-[3px] min-[900px]:text-[11px]">
              <li className="flex items-start gap-1 min-[900px]:gap-1">
                <Icon name="pin" size={12} className="mt-[2px] hidden shrink-0 text-white min-[900px]:block" />
                <span>120 Nguyễn Xí, Phường 26, Quận Bình Thạnh, TP. HCM</span>
              </li>
              <li className="flex items-center gap-1 min-[900px]:gap-1">
                <Icon name="phone" size={12} className="hidden shrink-0 text-white min-[900px]:block" />
                <a href={`tel:${HOTLINE_TEL}`} className="hover:text-white">
                  {HOTLINE_LABEL}
                </a>
              </li>
              <li className="flex items-center gap-1 min-[900px]:gap-1">
                <Icon name="chat" size={12} className="hidden shrink-0 text-white min-[900px]:block" />
                <a href="mailto:info@ndthich.com.vn" className="hover:text-white">
                  info@ndthich.com.vn
                </a>
              </li>
              <li className="flex items-start gap-1 min-[900px]:gap-1">
                <Icon name="clock" size={12} className="mt-[2px] hidden shrink-0 text-white min-[900px]:block" />
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
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-2 px-3 py-1 text-[6px] text-white/90 min-[900px]:px-10 min-[900px]:py-1 min-[900px]:text-[11px]">
          <span>© 2026 Nguyễn Đắc Thích. All rights reserved.</span>
          <span>Thiết kế bởi NDTHICH</span>
        </div>
      </div>
    </footer>
  );
}
