"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { logoutAction } from "@/app/actions/auth";

// One icon per destination. "Dự án" used to reuse "building" — the same glyph
// as "BĐS cho thuê" — so the two heaviest sections of the CMS were visually
// identical in compact mode, where the glyph is the ONLY label.
const NAV_ITEMS: { label: string; href: string; icon: IconName }[] = [
  { label: "Dashboard", href: "/admin", icon: "home" },
  { label: "Dự án", href: "/admin/du-an", icon: "shop" },
  { label: "BĐS cho thuê", href: "/admin/bds", icon: "building" },
  { label: "Tin tức", href: "/admin/tin-tuc", icon: "edit" },
  { label: "Trang Về chúng tôi", href: "/admin/gioi-thieu", icon: "person" },
  { label: "Trang Liên hệ", href: "/admin/lien-he", icon: "pin" },
  { label: "Cài đặt chung", href: "/admin/cai-dat", icon: "shield" },
];

// NOTE on colours in this file: `text-body` is BOTH a fontSize token (15px)
// and a palette colour (#4D4D4D), so writing `text-body` also sets a colour.
// Named palette utilities (`text-ink`, `text-muted`, `text-line`) are emitted
// after it and win; an arbitrary `text-[#B9B9B9]` does NOT. The idle nav
// labels used exactly that arbitrary form, so they rendered at #4D4D4D on
// #151515 — about 2:1 contrast, effectively unreadable — rather than the
// intended light grey. Anything on this dark rail therefore takes its colour
// from a named token (`line`/`surface`) with an opacity step.
const IDLE = "text-line/70";

function NavList({ compact, onNavigate }: { compact: boolean; onNavigate?: () => void }) {
  const pathname = usePathname() ?? "";
  return (
    <ul className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              aria-label={compact ? item.label : undefined}
              title={compact ? item.label : undefined}
              className={`flex items-center gap-3 rounded-sm px-3 py-3 text-body transition-colors duration-fast ease-base ${
                active
                  ? "bg-primary font-semibold text-surface"
                  : `${IDLE} hover:bg-surface/10 hover:text-surface`
              } ${compact ? "justify-center" : ""}`}
            >
              <Icon
                name={item.icon}
                size={18}
                className={`invert transition-opacity duration-fast ease-base ${active ? "opacity-100" : "opacity-70"}`}
              />
              {!compact && <span>{item.label}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SidebarBody({
  compact,
  onNavigate,
  onLogout,
}: {
  compact: boolean;
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  return (
    <nav aria-label="Điều hướng quản trị" className="flex h-full flex-col justify-between bg-footer py-6">
      <div>
        {/* The logo asset is opaque RGB with a baked-in white background, so on
            this dark rail it can only ever render as a white rectangle. Rather
            than let that read as a glitch, it sits on a deliberate white plate. */}
        <div className={`mb-6 flex items-center gap-2 px-3 ${compact ? "justify-center" : ""}`}>
          <span className="flex items-center rounded-sm bg-surface px-2 py-1">
            <Image
              src="/assets/v2/branding/dac-thich-land-logo-400.jpg"
              alt="NDTHICH LAND"
              width={512}
              height={512}
              className="h-6 w-auto"
              unoptimized
              loading="eager"
            />
          </span>
          {!compact && (
            <span className="text-label uppercase tracking-[0.14em] text-line/60">Quản trị</span>
          )}
        </div>
        <NavList compact={compact} onNavigate={onNavigate} />
      </div>
      {/* The old "Hệ thống" caption labelled nothing — one button is not a
          section. A hairline does the same separating job without the noise. */}
      <div className="mx-3 border-t border-surface/10 pt-3">
        <button
          type="button"
          onClick={onLogout}
          className={`flex w-full items-center gap-3 rounded-sm px-3 py-3 text-body transition-colors duration-fast ease-base ${IDLE} hover:bg-surface/10 hover:text-surface ${
            compact ? "justify-center" : ""
          }`}
        >
          {/* No power/exit glyph exists in the frozen icon set, so this stays
              a word rather than borrowing an icon that means something else. */}
          {compact ? "Thoát" : "Đăng xuất"}
        </button>
      </div>
    </nav>
  );
}

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const drawerRef = useFocusTrap(mobileOpen, onMobileClose);
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  async function handleLogout() {
    await logoutAction();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* Compact 768–1199px / Expanded >=1200px */}
      <div className="hidden tablet:block tablet:w-[76px] min-[1200px]:w-[248px]">
        <div className="fixed inset-y-0 hidden w-[76px] tablet:block min-[1200px]:hidden">
          <SidebarBody compact onLogout={handleLogout} />
        </div>
        <div className="fixed inset-y-0 hidden w-[248px] min-[1200px]:block">
          <SidebarBody compact={false} onLogout={handleLogout} />
        </div>
      </div>

      {/* Drawer <768px */}
      {mobileOpen && (
        <div className="tablet:hidden">
          <div
            className="fixed inset-0 z-drawer-backdrop bg-[rgba(0,0,0,.42)] animate-v2-fade-in"
            aria-hidden="true"
            onClick={onMobileClose}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu quản trị"
            className="fixed inset-y-0 left-0 z-drawer-panel w-[248px]"
          >
            <SidebarBody compact={false} onNavigate={onMobileClose} onLogout={handleLogout} />
          </div>
        </div>
      )}
    </>
  );
}
