"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";
import { DEFAULT_SITE_SETTINGS, telHref } from "@/lib/data/siteSettings";
import type { SiteSettings } from "@/lib/types";

const QUICK_LINKS = [
  { label: "Trang chủ", href: "/" },
  { label: "Dự án", href: "/du-an" },
  { label: "Cho thuê", href: "/cho-thue" },
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
export function Footer2({ settings = DEFAULT_SITE_SETTINGS }: { settings?: SiteSettings }) {
  const pathname = usePathname() ?? "";
  const compact = pathname === "/du-an";
  // Address/hotline/email/hours used to be hardcoded here AND in the homepage
  // contact panel — two copies to keep in sync by hand. Both now read the one
  // admin-editable record; the default keeps this component renderable on its
  // own (and in tests) without a settings fetch.
  const hotlineLabel = [settings.phonePrimary, settings.phoneSecondary].filter((p) => p.trim()).join(" - ");

  return (
    <footer className="bg-[#1C1F1E] text-white" data-qa-region="footer">
      {/* USER_APPROVED_PREMIUM_WIDE_SCALE section 16: v2-container, more
          vertical room (was py-1 = 4px at every breakpoint) and a wider
          column gap at >=1440px. */}
      <div className="v2-container py-6 min-[900px]:py-10 wide:py-[56px]">
        <div
          className={`grid gap-1 min-[900px]:grid-cols-[1.4fr_1fr_1fr_1.2fr] min-[900px]:gap-3 wide:gap-12 ${compact ? "grid-cols-2" : "grid-cols-3"}`}
        >
          <div>
            <Image
              src="/assets/v2/branding/ndthich-logo-reference.png"
              alt="NDTHICH"
              width={168}
              height={128}
              className="h-5 w-auto min-[900px]:h-6 wide:h-8"
              unoptimized
            />
            <p className="mt-1 text-[6px] font-bold uppercase tracking-wide text-white min-[900px]:mt-2 min-[900px]:text-[11px] wide:text-[13px]">
              NDTHICH LAND
            </p>
            <p className="mt-1 line-clamp-2 text-[6px] leading-tight text-[#A6A6A6] min-[900px]:mt-1 min-[900px]:text-[11px] wide:text-[14px] wide:leading-[24px]">
              {compact
                ? "Chuyên cho thuê mặt bằng & kinh doanh bất động sản."
                : "Chuyên cho thuê nhà, căn hộ, mặt bằng kinh doanh tại các vị trí đắc địa. Pháp lý rõ ràng, hỗ trợ tận tâm."}
            </p>
            <div className="mt-1 flex items-center gap-1 min-[900px]:mt-2 min-[900px]:gap-1 wide:mt-3 wide:gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-white hover:bg-[#880206] min-[900px]:h-6 min-[900px]:w-6 wide:h-8 wide:w-8"
                >
                  <Icon name={s.name} size={8} className="text-white min-[900px]:!h-3 min-[900px]:!w-3 wide:!h-4 wide:!w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className={compact ? "hidden min-[900px]:block" : ""}>
            <h3 className="text-[7px] font-bold uppercase tracking-wide text-white min-[900px]:text-[11px] wide:text-[16px] wide:leading-[22px]">
              Quick Links
            </h3>
            <ul className="mt-1 flex flex-col gap-[2px] leading-tight min-[900px]:mt-2 min-[900px]:gap-[2px] wide:mt-4 wide:gap-2">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[6px] text-[#A6A6A6] hover:text-white min-[900px]:text-[11px] wide:text-[14px] wide:leading-[24px]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden min-[900px]:block">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-white wide:text-[16px] wide:leading-[22px]">
              Loại hình
            </h3>
            <ul className="mt-2 flex flex-col gap-[2px] leading-tight wide:mt-4 wide:gap-2">
              {PROPERTY_TYPES.map((t) => (
                <li key={t}>
                  <Link href="/cho-thue" className="text-[11px] text-[#A6A6A6] hover:text-white wide:text-[14px] wide:leading-[24px]">
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[7px] font-bold uppercase tracking-wide text-white min-[900px]:text-[11px] wide:text-[16px] wide:leading-[22px]">
              <span className={compact ? "min-[900px]:hidden" : "hidden"}>Liên hệ</span>
              <span className={compact ? "hidden min-[900px]:inline" : "inline"}>Thông tin liên hệ</span>
            </h3>
            <ul className="mt-1 flex flex-col gap-[2px] text-[6px] leading-tight text-[#A6A6A6] min-[900px]:mt-2 min-[900px]:gap-[3px] min-[900px]:text-[11px] wide:mt-4 wide:gap-3 wide:text-[14px] wide:leading-[24px]">
              <li className="flex items-start gap-1 min-[900px]:gap-1">
                <Icon name="pin" size={12} className="mt-[2px] hidden shrink-0 text-white min-[900px]:block" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-1 min-[900px]:gap-1">
                <Icon name="phone" size={12} className="hidden shrink-0 text-white min-[900px]:block" />
                <a href={`tel:${telHref(settings.phonePrimary)}`} className="hover:text-white">
                  {hotlineLabel}
                </a>
              </li>
              <li className="flex items-center gap-1 min-[900px]:gap-1">
                <Icon name="chat" size={12} className="hidden shrink-0 text-white min-[900px]:block" />
                <a href={`mailto:${settings.email}`} className="hover:text-white">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-1 min-[900px]:gap-1">
                <Icon name="clock" size={12} className="mt-[2px] hidden shrink-0 text-white min-[900px]:block" />
                <span>
                  {settings.hoursWeekday}
                  {settings.hoursWeekend && (
                    <>
                      <br />
                      {settings.hoursWeekend}
                    </>
                  )}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-[#880206]">
        <div className="v2-container flex items-center justify-between gap-2 py-1 text-[6px] text-white/90 min-[900px]:py-1 min-[900px]:text-[11px] wide:py-3 wide:text-[13px] wide:leading-[22px]">
          <span>© 2026 NDTHICH LAND. All rights reserved.</span>
          <span>Thiết kế bởi NDTHICH</span>
        </div>
      </div>
    </footer>
  );
}
