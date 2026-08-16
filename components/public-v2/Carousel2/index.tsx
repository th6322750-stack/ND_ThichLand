"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";
import { useReducedMotion } from "@/lib/motion";

interface Carousel2Props {
  children: ReactNode;
  /** Names the region for screen readers, e.g. "Dự án nổi bật". */
  ariaLabel: string;
  /** Tailwind width classes for one slide, per breakpoint. Passed in rather
      than derived so each call site keeps the grid proportions it already
      had. */
  slideClassName: string;
  autoPlayMs?: number;
  className?: string;
  gapClassName?: string;
}

/**
 * Auto-advancing carousel built on a native horizontal scroll container.
 *
 * Why not a library: Slick/Swiper would pull jQuery or a large bundle into a
 * Next.js app for behaviour the platform already does better. Native
 * overflow scrolling gives real touch momentum, real drag on trackpads,
 * working keyboard navigation and focusable links inside the slides for
 * free; this component only adds the auto-advance, the paging controls and
 * the pause rules on top.
 *
 * Paging is measured from scroll geometry (scrollWidth / clientWidth) rather
 * than from a slides-per-view number, so it stays correct at any breakpoint
 * without the call site restating its layout.
 *
 * Auto-advance stops whenever it would be intrusive or wasteful: pointer
 * over it, keyboard focus inside it, the tab hidden, the user scrolling it
 * by hand, or prefers-reduced-motion. A visible pause control is also
 * provided — WCAG 2.2.2 requires a mechanism to stop motion that starts
 * automatically and runs more than five seconds, and hover alone does not
 * satisfy that for keyboard or touch users.
 */
export function Carousel2({
  children,
  ariaLabel,
  slideClassName,
  autoPlayMs = 4500,
  className = "",
  gapClassName = "gap-3 min-[900px]:gap-4 wide:gap-6",
}: Carousel2Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(0);
  const [canScroll, setCanScroll] = useState(false);
  // The visitor's explicit choice via the pause button. Kept separate from
  // the conditions below so toggling it never has to fight them.
  const [autoPlayWanted, setAutoPlayWanted] = useState(true);
  const reducedMotion = useReducedMotion();
  const playing = autoPlayWanted && canScroll && !reducedMotion;
  const pausedRef = useRef(false);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const overflowing = el.scrollWidth > el.clientWidth + 4;
    setCanScroll(overflowing);
    setPages(overflowing ? Math.ceil(el.scrollWidth / el.clientWidth) : 1);
    setPage(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
  }, []);

  useEffect(() => {
    measure();
    const el = trackRef.current;
    if (!el) return;
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
    observer?.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const goTo = useCallback((index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const total = Math.ceil(el.scrollWidth / el.clientWidth);
    const next = ((index % total) + total) % total;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      // document.hidden: a background tab should not burn frames, and the
      // visitor would otherwise return to a carousel that had silently
      // advanced past everything.
      if (pausedRef.current || document.hidden) return;
      const el = trackRef.current;
      if (!el) return;
      const total = Math.ceil(el.scrollWidth / el.clientWidth);
      const current = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
      goTo(current + 1 >= total ? 0 : current + 1);
    }, autoPlayMs);
    return () => window.clearInterval(id);
  }, [playing, autoPlayMs, goTo]);

  const pause = () => {
    pausedRef.current = true;
  };
  const resume = () => {
    pausedRef.current = false;
  };

  return (
    <div
      className={`relative ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={resume}
      onTouchStart={pause}
    >
      <div
        ref={trackRef}
        onScroll={() => {
          const el = trackRef.current;
          if (el) setPage(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
        }}
        className={`v2-track flex ${gapClassName} overflow-x-auto overscroll-x-contain scroll-smooth ${
          canScroll ? "snap-x snap-mandatory" : ""
        }`}
      >
        {/* toArray, not children.map: a caller passing a single element or a
            fragment would otherwise throw. */}
        {Children.toArray(children).map((child, i) => (
          <div key={i} className={`shrink-0 snap-start ${slideClassName}`}>
            {child}
          </div>
        ))}
      </div>

      {canScroll && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            aria-label="Xem mục trước"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E4E1E0] text-[#5F5D5D] transition-colors duration-fast ease-base hover:border-[#880206] hover:text-[#880206]"
          >
            <Icon name="chevron-right" size={14} className="rotate-180" />
          </button>

          <div className="flex items-center gap-[6px]">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Tới nhóm ${i + 1} / ${pages}`}
                aria-current={i === page ? "true" : undefined}
                className={`h-2 rounded-full transition-[width,background-color] duration-base ease-base ${
                  i === page ? "w-6 bg-[#880206]" : "w-2 bg-[#E4E1E0] hover:bg-[#C9C6C5]"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => goTo(page + 1)}
            aria-label="Xem mục kế tiếp"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E4E1E0] text-[#5F5D5D] transition-colors duration-fast ease-base hover:border-[#880206] hover:text-[#880206]"
          >
            <Icon name="chevron-right" size={14} />
          </button>

          <button
            type="button"
            onClick={() => setAutoPlayWanted((p) => !p)}
            aria-label={playing ? "Tạm dừng tự động chuyển" : "Bật tự động chuyển"}
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-full border border-[#E4E1E0] text-[#5F5D5D] transition-colors duration-fast ease-base hover:border-[#880206] hover:text-[#880206]"
          >
            {/* Pure CSS glyphs — the frozen icon set has no play/pause. */}
            {playing ? (
              <span aria-hidden="true" className="flex gap-[3px]">
                <span className="block h-[10px] w-[3px] bg-current" />
                <span className="block h-[10px] w-[3px] bg-current" />
              </span>
            ) : (
              <span
                aria-hidden="true"
                className="ml-[2px] block h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-current"
              />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
