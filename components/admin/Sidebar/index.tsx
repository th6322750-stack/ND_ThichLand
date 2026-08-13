"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { logout } from "@/lib/admin-auth";

const NAV_ITEMS: { label: string; href: string; icon: IconName }[] = [
  { label: "Dashboard", href: "/admin", icon: "home" },
  { label: "BĐS cho thuê", href: "/admin/bds", icon: "building" },
  { label: "Dự án", href: "/admin/du-an", icon: "building" },
  { label: "Tin tức", href: "/admin/tin-tuc", icon: "edit" },
  { label: "Media", href: "/admin/media", icon: "upload" },
];

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
              className={`flex items-center gap-3 rounded-md px-3 py-3 text-body ${
                active ? "bg-primary text-surface" : "text-[#B9B9B9] hover:bg-[#242424] hover:text-surface"
              } ${compact ? "justify-center" : ""}`}
            >
              <Icon name={item.icon} size={18} className="invert" />
              {!compact && <span>{item.label}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SidebarBody({ compact, onNavigate }: { compact: boolean; onNavigate?: () => void }) {
  return (
    <nav aria-label="Điều hướng quản trị" className="flex h-full flex-col justify-between bg-footer py-6">
      <div>
        <div className={`mb-6 px-3 text-h3 text-surface ${compact ? "text-center" : ""}`}>
          {compact ? "N" : "NDTHICH Admin"}
        </div>
        <NavList compact={compact} onNavigate={onNavigate} />
      </div>
      <div className="px-3">
        <p className={`text-body text-[#7A7A7A] ${compact ? "text-center" : ""}`}>Hệ thống</p>
        <button
          type="button"
          onClick={() => logout()}
          className={`mt-2 flex w-full items-center gap-3 rounded-md px-3 py-3 text-body text-[#B9B9B9] hover:bg-[#242424] hover:text-surface ${
            compact ? "justify-center" : ""
          }`}
        >
          {!compact && <span>Đăng xuất</span>}
          {compact && <span>⏻</span>}
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

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Compact 768–1199px / Expanded >=1200px */}
      <div className="hidden tablet:block tablet:w-[76px] min-[1200px]:w-[248px]">
        <div className="fixed inset-y-0 hidden w-[76px] tablet:block min-[1200px]:hidden">
          <SidebarBody compact />
        </div>
        <div className="fixed inset-y-0 hidden w-[248px] min-[1200px]:block">
          <SidebarBody compact={false} />
        </div>
      </div>

      {/* Drawer <768px */}
      {mobileOpen && (
        <div className="tablet:hidden">
          <div
            className="fixed inset-0 z-drawer-backdrop bg-[rgba(0,0,0,.42)]"
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
            <SidebarBody compact={false} onNavigate={onMobileClose} />
          </div>
        </div>
      )}
    </>
  );
}
