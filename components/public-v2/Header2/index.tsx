"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";

const NAV = [
  { label: "Trang chủ", href: "/" },
  { label: "Dự án", href: "/du-an" },
  { label: "Cho thuê", href: "/cho-thue" },
  { label: "Về chúng tôi", href: "/gioi-thieu" },
  { label: "Tin tức", href: "/tin-tuc" },
  { label: "Liên hệ", href: "/lien-he" },
];

// One number, not two. The pill expands on hover, and animating it open at
// the width of "0986 602 203 - 0985 551 396" was both a long travel and a
// wide layout change every frame — it read as a stutter. The second line is
// still in the footer and the contact block.
const HOTLINE_LABEL = "0986 602 203";
// Mobile masters show a single-number hotline pill — each of the 5 mobile
// master exports uses a different mock number, so this uses the one real
// hotline number everywhere rather than fabricating a route-specific one.
const HOTLINE_MOBILE_LABEL = "0986 602 203";
const HOTLINE_TEL = "0986602203";

type HeaderVariant = "home" | "cho-thue" | "cho-thue-detail" | "du-an" | "du-an-detail";

// The 5 mobile masters genuinely disagree with each other on hotline
// button style (icon-only square vs icon+text pill) and hamburger style
// (bordered square vs plain icon) — round 2 wrongly "normalized" this to
// one majority pattern. Each route now reproduces its OWN master exactly
// instead.
// mobilePadding: measured per-route from the mobile masters — Property
// Detail/Project Detail show a visibly taller header band (~78px) than
// Home/Cho Thue/Project List (~64px).
const HEADER_VARIANTS: Record<
  HeaderVariant,
  { tagline: boolean; hotlineTextMobile: boolean; hamburgerBorderMobile: boolean; mobilePadding: string }
> = {
  home: { tagline: false, hotlineTextMobile: true, hamburgerBorderMobile: true, mobilePadding: "py-1" },
  "cho-thue": { tagline: false, hotlineTextMobile: false, hamburgerBorderMobile: true, mobilePadding: "py-2" },
  "cho-thue-detail": { tagline: true, hotlineTextMobile: true, hamburgerBorderMobile: false, mobilePadding: "py-[14px]" },
  "du-an": { tagline: false, hotlineTextMobile: true, hamburgerBorderMobile: false, mobilePadding: "py-1" },
  "du-an-detail": { tagline: false, hotlineTextMobile: true, hamburgerBorderMobile: true, mobilePadding: "py-2" },
};

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function headerVariantFor(pathname: string): HeaderVariant {
  if (pathname.startsWith("/cho-thue/")) return "cho-thue-detail";
  if (pathname.startsWith("/cho-thue")) return "cho-thue";
  if (pathname.startsWith("/du-an/")) return "du-an-detail";
  if (pathname.startsWith("/du-an")) return "du-an";
  return "home";
}

export function Header2() {
  const pathname = usePathname() ?? "";
  const variant = HEADER_VARIANTS[headerVariantFor(pathname)];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useFocusTrap(mobileOpen, () => setMobileOpen(false));
  const hotlineRef = useRef<HTMLAnchorElement>(null);

  // The open width is the label's own width, measured rather than guessed, so
  // the easing curve describes exactly the distance the pill travels. Written
  // straight to the node as a custom property — no state, no re-render.
  useEffect(() => {
    const el = hotlineRef.current;
    const label = el?.querySelector<HTMLElement>(".v2-hotline-label");
    if (!el || !label) return;
    el.style.setProperty("--v2-hotline-w", `${label.scrollWidth}px`);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Lifts the sticky header off the page once it starts overlapping content,
  // so it reads as a floating bar instead of a flat strip welded to the top.
  // Passive listener + a boolean (not a scroll position in state) means at
  // most two re-renders for a whole page of scrolling.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white transition-[box-shadow,border-color] duration-base ease-base ${
        scrolled ? "border-transparent shadow-[0_6px_24px_-12px_rgba(12,13,13,0.28)]" : "border-[#EDEBEA] shadow-none"
      }`}
      data-qa-region="header"
    >
      <div
        className={`v2-container flex items-center justify-between gap-4 ${variant.mobilePadding} min-[900px]:py-3 wide:min-h-[80px] wide:py-4`}
      >
        {/* Both outer groups grow equally (flex-1) so the nav lands on the
            header's true centre. Under justify-between it was only centred in
            the leftover space, and the logo lockup is far wider than the 44px
            hotline disc — so it sat visibly right of centre. */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 transition-opacity duration-fast ease-base hover:opacity-80 min-[900px]:flex-1"
        >
          {/* Client feedback: logo + company name read too small against
              the header's width, with a lot of empty vertical margin
              around them — logo up ~12% (32px -> 36px), and at >=1440px
              (USER_APPROVED_PREMIUM_WIDE_SCALE) up again to 44px, using
              v2-container so the header content actually widens with the
              viewport instead of clumping in a fixed 1240px column. */}
          <Image
            src="/assets/v2/branding/ndthich-logo-reference.png"
            alt="NDTHICH"
            width={168}
            height={128}
            className="h-[30px] w-auto min-[900px]:h-[36px] wide:h-[44px]"
            unoptimized
          />
          {variant.tagline && (
            <span className="whitespace-nowrap text-[8px] leading-tight text-[#5F5D5D] min-[900px]:hidden">
              Không gian sống &amp;
              <br />
              Kinh doanh lý tưởng
            </span>
          )}
          {/* Two-line lockup: a quiet descriptor over the name, so the mark
              says what the company does without spending the brand colour on
              it. Single-line "NDTHICH LAND" carried no such line. */}
          <span className="hidden whitespace-nowrap leading-tight min-[900px]:block">
            <span className="block text-[10px] font-medium text-[#5F5D5D] wide:text-[11px]">Bất động sản</span>
            <span className="block text-[14px] font-bold text-[#880206] wide:text-[16px]">NDTHICH LAND</span>
          </span>
        </Link>

        <nav className="hidden shrink-0 items-center gap-5 min-[900px]:flex wide:gap-[28px] whitespace-nowrap">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                // The underline grows out from the centre on hover rather
                // than snapping on, via a scaled pseudo-element-free trick:
                // the border lives on an inner span so only it animates.
                className={`group relative pb-1 text-[15px] font-medium transition-colors duration-fast ease-base wide:text-v2-nav ${
                  active ? "text-[#880206]" : "text-[#1C1F1E] hover:text-[#880206]"
                }`}
              >
                {item.label}
                {/* Underline scales out from the centre on hover; the active
                    item keeps it permanently drawn. */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 bottom-0 h-[2px] origin-center bg-[#880206] transition-transform duration-base ease-base ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 min-[900px]:flex-1 min-[900px]:justify-end">
          {/* Collapsed to a phone disc until hovered/focused. The pill sits
              absolutely inside a fixed 44px slot so opening it does not take
              layout space — growing it in flow pushed the whole nav left every
              time the pointer crossed it, which is the "stutter" that was
              actually being seen. See .v2-hotline in globals.css. */}
          <span className="v2-hotline-slot hidden min-[900px]:block">
            <a
              ref={hotlineRef}
              href={`tel:${HOTLINE_TEL}`}
              aria-label={`Gọi hotline ${HOTLINE_LABEL}`}
              className="btn-primary-gradient v2-hotline h-[44px] items-center whitespace-nowrap rounded-full px-[13px] text-[11px] font-semibold text-white active:scale-[0.96] motion-reduce:active:scale-100 wide:text-[13px]"
            >
              <Icon name="phone" size={16} className="shrink-0 text-white" />
              {/* The gap sits on an inner span, not on the collapsing column
                  itself: padding belongs to the element's own box and survives
                  a 0fr track, so it stayed behind as an 8px sliver. As content
                  it gets clipped away with the text. */}
              <span className="v2-hotline-label">
                <span className="pl-2">{HOTLINE_LABEL}</span>
              </span>
            </a>
          </span>
          {variant.hotlineTextMobile ? (
            <a
              href={`tel:${HOTLINE_TEL}`}
              className="btn-primary-gradient flex items-center gap-[6px] rounded-full px-3 py-[6px] text-[11px] font-semibold text-white transition-transform duration-fast ease-base active:scale-[0.94] motion-reduce:active:scale-100 min-[900px]:hidden"
            >
              <Icon name="phone" size={12} className="text-white" /> {HOTLINE_MOBILE_LABEL}
            </a>
          ) : (
            <a
              href={`tel:${HOTLINE_TEL}`}
              aria-label={`Gọi ${HOTLINE_MOBILE_LABEL}`}
              className="btn-primary-gradient flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-lg text-white transition-transform duration-fast ease-base active:scale-[0.94] motion-reduce:active:scale-100 min-[900px]:hidden"
            >
              <Icon name="phone" size={15} className="text-white" />
            </a>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Mở menu"
            aria-expanded={mobileOpen}
            aria-haspopup="dialog"
            aria-controls="header2-mobile-menu"
            className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-md transition-colors duration-fast ease-base min-[900px]:hidden ${
              variant.hamburgerBorderMobile ? "border border-[#E4E1E0]" : ""
            }`}
          >
            <Icon name="menu" size={18} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="min-[900px]:hidden">
          <div
            className="fixed inset-0 z-drawer-backdrop bg-[rgba(0,0,0,.42)] animate-v2-fade-in"
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
          />
          <div
            ref={drawerRef}
            id="header2-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng"
            className="fixed inset-y-0 right-0 z-drawer-panel w-[288px] animate-v2-drawer-in bg-white p-6 shadow-xl"
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Đóng menu"
              className="ml-auto flex h-[36px] w-[36px] items-center justify-center rounded-md border border-[#E4E1E0] transition-colors duration-fast ease-base hover:border-[#880206]"
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
                  className="rounded-md px-3 py-3 text-[15px] font-medium text-[#1C1F1E] transition-colors duration-fast ease-base hover:bg-[#F7F6F6] aria-[current=page]:font-bold aria-[current=page]:text-[#880206]"
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
