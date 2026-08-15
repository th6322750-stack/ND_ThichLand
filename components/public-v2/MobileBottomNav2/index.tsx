"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon2 as Icon, type IconName } from "@/components/public-v2/Icon2";

const TABS: { label: string; href: string; icon: IconName }[] = [
  { label: "Trang chủ", href: "/", icon: "home" },
  { label: "Cho thuê", href: "/cho-thue", icon: "shop" },
  { label: "Dự án", href: "/du-an", icon: "building" },
];

const MENU_LINKS = [
  { label: "Trang chủ", href: "/" },
  { label: "Cho thuê", href: "/cho-thue" },
  { label: "Dự án", href: "/du-an" },
  { label: "Về chúng tôi", href: "/gioi-thieu" },
  { label: "Tin tức", href: "/tin-tuc" },
  { label: "Liên hệ", href: "/lien-he" },
];

// 02_ChoThue_MOBILE.png's fixed bottom tab bar (Trang chủ / Cho thuê / Dự án
// / Yêu thích / Menu) — real DOM buttons/links, not a screenshot overlay.
// "Yêu thích" has no backing route (favorites are a visual-only affordance
// everywhere else in this codebase too, e.g. PropertyListRow2's heart button
// — no persistence layer exists for it), so it renders as a real but
// non-navigating button rather than linking to a page that doesn't exist.
// "Menu" opens a lightweight local sheet with the same site links
// Header2's hamburger drawer shows.
export function MobileBottomNav2() {
  const pathname = usePathname() ?? "";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Điều hướng nhanh"
        className="fixed inset-x-0 bottom-0 z-sticky-mobile-actions flex items-center justify-around border-t border-[#EDEBEA] bg-white py-1 min-[900px]:hidden"
        data-qa-region="bottom-nav"
      >
        {TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-[2px] px-2 py-1 text-[10px] font-medium ${
                active ? "text-[#880206]" : "text-[#3A3838]"
              }`}
            >
              <Icon name={tab.icon} size={20} />
              {tab.label}
            </Link>
          );
        })}
        <button type="button" className="flex flex-col items-center gap-[2px] px-2 py-1 text-[10px] font-medium text-[#3A3838]">
          <Icon name="heart" size={20} />
          Yêu thích
        </button>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex flex-col items-center gap-[2px] px-2 py-1 text-[10px] font-medium text-[#3A3838]"
        >
          <Icon name="menu" size={20} />
          Menu
        </button>
      </nav>

      {menuOpen && (
        <div className="min-[900px]:hidden">
          <div className="fixed inset-0 z-drawer-backdrop bg-[rgba(0,0,0,.42)]" aria-hidden="true" onClick={() => setMenuOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng"
            className="fixed inset-x-0 bottom-0 z-drawer-panel rounded-t-2xl bg-white p-5"
          >
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Đóng menu"
                className="flex h-[36px] w-[36px] items-center justify-center rounded-md border border-[#E4E1E0]"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            <nav className="mt-2 flex flex-col gap-1">
              {MENU_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-3 text-[15px] font-medium text-[#1C1F1E] hover:bg-[#F7F6F6]"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
