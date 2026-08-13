"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { Icon } from "@/components/icons";

const NAV_ITEMS = [
  { label: "Trang chủ", href: "/" },
  { label: "Cho thuê", href: "/cho-thue" },
  { label: "Dự án", href: "/du-an" },
  { label: "Giới thiệu", href: "/gioi-thieu" },
  { label: "Tin tức", href: "/tin-tuc" },
  { label: "Liên hệ", href: "/lien-he" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <Image src="/assets/logos/NO_LOGO.svg" alt="NDTHICH LAND" width={40} height={40} unoptimized />
      <span className="flex flex-col leading-tight">
        <span className="text-h3 text-ink">NDTHICH LAND</span>
        <span className="text-[11px] uppercase tracking-wide text-muted">
          Đầu tư &amp; Kinh doanh Nguyễn Đắc Thích
        </span>
      </span>
    </Link>
  );
}

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useFocusTrap(drawerOpen, () => setDrawerOpen(false));
  const pathname = usePathname();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 0);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <header
      className={`sticky top-0 z-sticky-header bg-surface transition-shadow duration-base ${
        scrolled ? "h-16 shadow-[0_2px_12px_rgba(0,0,0,0.08)]" : "h-20"
      }`}
    >
      <div className="container-page flex h-full items-center justify-between">
        <Logo />

        <nav aria-label="Chính" className="hidden desktop:block">
          <ul className="flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActiveRoute(pathname, item.href) ? "page" : undefined}
                  className="text-label text-ink hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden desktop:block">
          <a
            href="tel:0986602203"
            className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
          >
            0986 602 203
          </a>
        </div>

        <div className="flex items-center gap-2 desktop:hidden">
          <a
            href="tel:0986602203"
            aria-label="Gọi 0986 602 203"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-surface hover:bg-primaryHover"
          >
            <Icon name="phone" size={18} className="invert" />
          </a>
          <button
            type="button"
            aria-label="Menu"
            className="flex h-11 w-11 items-center justify-center"
            onClick={() => setDrawerOpen(true)}
          >
            <Image src="/assets/icons/menu.svg" alt="" width={28} height={28} unoptimized />
          </button>
        </div>
      </div>

      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-drawer-backdrop bg-[rgba(0,0,0,.42)]"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng"
            className="fixed inset-y-0 right-0 z-drawer-panel w-[88vw] max-w-[360px] bg-surface p-6 shadow-xl"
          >
            <div className="flex justify-end">
              <button
                type="button"
                aria-label="Đóng menu"
                className="flex h-11 w-11 items-center justify-center"
                onClick={() => setDrawerOpen(false)}
              >
                ✕
              </button>
            </div>
            <ul className="mt-6 flex flex-col gap-4">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActiveRoute(pathname, item.href) ? "page" : undefined}
                    className="text-h3 text-ink"
                    onClick={() => setDrawerOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <a
              href="tel:0986602203"
              className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-button uppercase text-surface"
            >
              0986 602 203
            </a>
          </div>
        </>
      )}
    </header>
  );
}
