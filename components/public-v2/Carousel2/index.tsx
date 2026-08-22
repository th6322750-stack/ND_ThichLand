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
 * by hand, or prefers-reduced-motion.
 *
 * No visible pause button by user decision (2026-08-17) — three
 * independently-autoplaying carousels stacked close together on the
 * homepage each showing their own pause toggle read as a duplicated
 * control. WCAG 2.2.2 technically wants a visible stop mechanism for
 * auto-motion past 5s; hover/focus/touch-pause above is the mitigation kept
 * in its place.
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
  const reducedMotion = useReducedMotion();
  const playing = canScroll && !reducedMotion;
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

  // Drag-to-scroll, mouse only.
  //
  // Touch already works: the track is a native overflow-x container, so a
  // finger swipe gets real momentum and rubber-banding from the browser —
  // measured moving scrollLeft 0 -> 186 on a phone viewport. A mouse gets
  // none of that from the platform, so on desktop the arrows were the only
  // way across, which is what this adds. Touch is deliberately left to the
  // browser rather than re-implemented worse.
  const dragRef = useRef<{ startX: number; startScroll: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = trackRef.current;
    if (!el || !canScroll) return;
    dragRef.current = { startX: e.clientX, startScroll: el.scrollLeft, moved: false };
    setDragging(true);
    // Without capture the browser starts its own image/link drag on the first
    // move and swallows every pointermove after that — measured: three events
    // for a whole drag, and scrollLeft never budged.
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const el = trackRef.current;
    if (!drag || !el) return;
    const delta = e.clientX - drag.startX;
    // A few pixels of slop so a slightly shaky click still reaches the card.
    if (!drag.moved && Math.abs(delta) < 5) return;
    drag.moved = true;
    el.scrollLeft = drag.startScroll - delta;
  }

  function endDrag() {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    setDragging(false);
    if (!drag.moved) return;
    // Every slide is a link; without this, letting go after a drag would
    // navigate to whichever card happens to be under the cursor.
    trackRef.current?.addEventListener(
      "click",
      (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
      },
      { capture: true, once: true },
    );
    // Where it lands is left to CSS scroll-snap, which comes back the moment
    // `dragging` clears and settles on the nearest slide. Rounding to a whole
    // page here instead threw away most drags: dragging 540px of a 1376px
    // page rounds to page 0, so the track sprang back to where it started.
  }

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
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        // Cards contain images and links, both of which the browser will
        // happily start a native drag-and-drop with.
        onDragStart={(e) => e.preventDefault()}
        className={`v2-track flex ${gapClassName} overflow-x-auto overscroll-x-contain ${
          // scroll-smooth would fight the direct scrollLeft writes below, and
          // snapping mid-drag would yank the track out from under the cursor.
          dragging ? "cursor-grabbing select-none" : "scroll-smooth"
        } ${canScroll && !dragging ? "snap-x snap-mandatory" : ""} ${
          canScroll && !dragging ? "min-[900px]:cursor-grab" : ""
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
          <button type="button" onClick={() => goTo(page - 1)} aria-label="Xem mục trước" className="v2-arrow">
            {/* Two arrows: the pair slides one slot on hover, so a fresh
                arrow arrives as the first leaves. See .v2-arrow in globals.css. */}
            <span className="v2-arrow-track" aria-hidden="true">
              <span className="v2-arrow-slot">
                <Icon name="chevron-right" size={14} className="rotate-180" />
              </span>
              <span className="v2-arrow-slot">
                <Icon name="chevron-right" size={14} className="rotate-180" />
              </span>
            </span>
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

          <button type="button" onClick={() => goTo(page + 1)} aria-label="Xem mục kế tiếp" className="v2-arrow">
            <span className="v2-arrow-track" aria-hidden="true">
              <span className="v2-arrow-slot">
                <Icon name="chevron-right" size={14} />
              </span>
              <span className="v2-arrow-slot">
                <Icon name="chevron-right" size={14} />
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
