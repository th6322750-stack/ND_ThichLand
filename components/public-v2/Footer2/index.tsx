"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";
import { DEFAULT_SITE_SETTINGS, telHref } from "@/lib/data/siteSettings";
import type { SiteSettings } from "@/lib/types";
import { getZaloUrl } from "@/lib/zalo";

const QUICK_LINKS = [
  { label: "Trang chủ", href: "/" },
  { label: "Dự án", href: "/du-an" },
  { label: "Cho thuê", href: "/cho-thue" },
  { label: "Về chúng tôi", href: "/gioi-thieu" },
  { label: "Tin tức", href: "/tin-tuc" },
  { label: "Liên hệ", href: "/lien-he" },
];

const PROPERTY_TYPES = ["Căn hộ", "Nhà nguyên căn", "Mặt bằng kinh doanh", "Văn phòng", "Kho xưởng", "Đất nền"];

function configuredHttpUrl(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function socialLinks(phonePrimary: string) {
  return [
    { name: "facebook" as const, href: configuredHttpUrl(process.env.NEXT_PUBLIC_FACEBOOK_URL), label: "Facebook" },
    { name: "youtube" as const, href: configuredHttpUrl(process.env.NEXT_PUBLIC_YOUTUBE_URL), label: "YouTube" },
    { name: "chat" as const, href: getZaloUrl() ?? `tel:${telHref(phonePrimary)}`, label: "Zalo hoặc gọi hotline" },
    { name: "tiktok" as const, href: configuredHttpUrl(process.env.NEXT_PUBLIC_TIKTOK_URL), label: "TikTok" },
  ].filter((item): item is typeof item & { href: string } => item.href !== null);
}

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
  const socials = socialLinks(settings.phonePrimary);

  return (
    <footer className="bg-[#1C1F1E] text-white" data-qa-region="footer">
      {/* USER_APPROVED_PREMIUM_WIDE_SCALE section 16: v2-container, more
          vertical room (was py-1 = 4px at every breakpoint) and a wider
          column gap at >=1440px. */}
      <div className="v2-container py-6 min-[900px]:py-10 wide:py-[56px]">
        <div
          className="grid grid-cols-2 gap-x-6 gap-y-8 min-[900px]:grid-cols-[1.4fr_1fr_1fr_1.2fr] min-[900px]:gap-3 wide:gap-12"
        >
          <div className={compact ? "" : "col-span-2 min-[900px]:col-span-1"}>
            <Image
              src="/assets/v2/branding/ndthich-logo-reference.png"
              alt="NDTHICH"
              width={168}
              height={128}
              className="h-8 w-auto min-[900px]:h-6 wide:h-8"
              unoptimized
            />
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-white min-[900px]:mt-2 min-[900px]:text-[11px] wide:text-[13px]">
              NDTHICH LAND
            </p>
            <p className="mt-2 max-w-sm text-[12px] leading-[20px] text-[#A6A6A6] min-[900px]:mt-1 min-[900px]:line-clamp-2 min-[900px]:text-[11px] min-[900px]:leading-tight wide:text-[14px] wide:leading-[24px]">
              {compact
                ? "Chuyên cho thuê mặt bằng & kinh doanh bất động sản."
                : "Chuyên cho thuê nhà, căn hộ, mặt bằng kinh doanh tại các vị trí đắc địa. Pháp lý rõ ràng, hỗ trợ tận tâm."}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1 min-[900px]:mt-2 min-[900px]:gap-1 wide:mt-3 wide:gap-2">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.label}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noreferrer" : undefined}
                  className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#880206] min-[900px]:h-8 min-[900px]:w-8 wide:h-[44px] wide:w-[44px]"
                >
                  <Icon name={s.name} size={18} className="text-white min-[900px]:!h-4 min-[900px]:!w-4 wide:!h-5 wide:!w-5" />
                </a>
              ))}
            </div>
          </div>

          <div className={compact ? "hidden min-[900px]:block" : ""}>
            <h3 className="text-[12px] font-bold uppercase tracking-wide text-white min-[900px]:text-[11px] wide:text-[16px] wide:leading-[22px]">
              Quick Links
            </h3>
            <ul className="mt-1 flex flex-col gap-[2px] leading-tight min-[900px]:mt-2 min-[900px]:gap-[2px] wide:mt-4 wide:gap-2">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="flex min-h-[44px] items-center text-[12px] text-[#A6A6A6] hover:text-white min-[900px]:min-h-8 min-[900px]:text-[11px] wide:min-h-[44px] wide:text-[14px] wide:leading-[24px]"
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
                  <Link href="/cho-thue" className="flex min-h-[44px] items-center text-[11px] text-[#A6A6A6] hover:text-white wide:text-[14px] wide:leading-[24px]">
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-wide text-white min-[900px]:text-[11px] wide:text-[16px] wide:leading-[22px]">
              <span className={compact ? "min-[900px]:hidden" : "hidden"}>Liên hệ</span>
              <span className={compact ? "hidden min-[900px]:inline" : "inline"}>Thông tin liên hệ</span>
            </h3>
            <ul className="mt-2 flex flex-col gap-1 text-[11px] leading-[18px] text-[#A6A6A6] min-[900px]:mt-2 min-[900px]:gap-[3px] min-[900px]:text-[11px] min-[900px]:leading-tight wide:mt-4 wide:gap-3 wide:text-[14px] wide:leading-[24px]">
              <li className="flex items-start gap-1 min-[900px]:gap-1">
                <Icon name="pin" size={12} className="mt-[2px] hidden shrink-0 text-white min-[900px]:block" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-1 min-[900px]:gap-1">
                <Icon name="phone" size={12} className="hidden shrink-0 text-white min-[900px]:block" />
                <a href={`tel:${telHref(settings.phonePrimary)}`} className="inline-flex min-h-[44px] items-center hover:text-white min-[900px]:min-h-8 wide:min-h-[44px]">
                  {hotlineLabel}
                </a>
              </li>
              <li className="flex items-center gap-1 min-[900px]:gap-1">
                <Icon name="chat" size={12} className="hidden shrink-0 text-white min-[900px]:block" />
                <a href={`mailto:${settings.email}`} className="inline-flex min-h-[44px] items-center break-all hover:text-white min-[900px]:min-h-8 wide:min-h-[44px]">
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
        <div className="v2-container flex items-center justify-between gap-2 py-2 text-[9px] text-white/90 min-[900px]:py-1 min-[900px]:text-[11px] wide:py-3 wide:text-[13px] wide:leading-[22px]">
          <span>© 2026 NDTHICH LAND. All rights reserved.</span>
          <span>Thiết kế bởi NDTHICH</span>
        </div>
      </div>
    </footer>
  );
}
