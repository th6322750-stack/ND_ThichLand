"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { Icon } from "@/components/icons";

const NAV = [
  { label: "Trang chủ", href: "/" },
  { label: "Cho thuê", href: "/cho-thue" },
  { label: "Dự án", href: "/du-an" },
  { label: "Về chúng tôi", href: "/gioi-thieu" },
  { label: "Tin tức", href: "/tin-tuc" },
  { label: "Liên hệ", href: "/lien-he" },
];

const HOTLINE_LABEL = "0984 602 303 - 0989 811 396";
// Mobile masters show a single-number hotline pill (not both numbers, which
// don't fit a compact pill) — the 5 mobile master exports disagree with each
// other on the exact phone number shown (each screenshot has a different
// mock number) and on hamburger border/pill-vs-icon treatment, so this
// reproduces the majority pattern (pill+text, borderless hamburger, seen in
// 3 of 5 masters) using the one real hotline number rather than fabricating
// a different number per route.
const HOTLINE_MOBILE_LABEL = "0984 602 303";
const HOTLINE_TEL = "0984602303";

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Header2() {
  const pathname = usePathname() ?? "";
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useFocusTrap(mobileOpen, () => setMobileOpen(false));

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#EDEBEA] bg-white">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-4 py-3 min-[900px]:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/assets/v2/branding/ndthich-logo-reference.png"
            alt="NDTHICH"
            width={168}
            height={128}
            className="h-[36px] w-auto min-[900px]:h-8"
            unoptimized
          />
          <span className="hidden whitespace-nowrap text-[9px] leading-tight text-[#5F5D5D] min-[900px]:block">
            CÔNG TY TNHH MTV
            <br />
            <span className="font-bold text-[#880206]">NGUYỄN ĐẮC THÍCH</span>
          </span>
        </Link>

        <nav className="hidden shrink-0 items-center gap-3 min-[900px]:flex whitespace-nowrap">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`border-b-2 pb-1 text-[14px] font-medium transition-colors ${
                  active
                    ? "border-[#880206] text-[#880206]"
                    : "border-transparent text-[#1C1F1E] hover:text-[#880206]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={`tel:${HOTLINE_TEL}`}
            className="hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-[#880206] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#750F0D] min-[900px]:flex"
          >
            <Icon name="phone" size={14} className="invert" /> {HOTLINE_LABEL}
          </a>
          <a
            href={`tel:${HOTLINE_TEL}`}
            className="flex items-center gap-[6px] rounded-full bg-[#880206] px-[14px] py-2 text-[12px] font-semibold text-white min-[900px]:hidden"
          >
            <Icon name="phone" size={14} className="invert" /> {HOTLINE_MOBILE_LABEL}
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Mở menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md min-[900px]:hidden"
          >
            <Icon name="menu" size={20} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="min-[900px]:hidden">
          <div
            className="fixed inset-0 z-drawer-backdrop bg-[rgba(0,0,0,.42)]"
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng"
            className="fixed inset-y-0 right-0 z-drawer-panel w-72 bg-white p-6 shadow-xl"
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Đóng menu"
              className="ml-auto flex h-[36px] w-[36px] items-center justify-center rounded-md border border-[#E4E1E0]"
            >
              <Icon name="close" size={18} />
            </button>
            <nav className="mt-6 flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className="rounded-md px-3 py-3 text-[15px] font-medium text-[#1C1F1E] hover:bg-[#F7F6F6]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
