"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Icon2 as Icon } from "@/components/public-v2/Icon2";

/**
 * Content clamped to a teaser height with a fade into the page background and
 * a "Xem thêm" control, instead of a `<details>` that hides everything until
 * clicked. A visitor can see what is in the block and decide whether to open
 * it, which a collapsed disclosure never lets them do.
 *
 * `<details>/<summary>` cannot express this — a closed `details` hides its
 * content entirely — so this is a button with `aria-expanded`/`aria-controls`
 * over a region that is always in the DOM. That also keeps the text findable
 * by in-page search and by crawlers while collapsed.
 *
 * The control only appears when the content is actually taller than the clamp.
 * Otherwise it would be a "Xem thêm" that reveals nothing.
 */
export function ExpandableBlock2({
  children,
  moreLabel = "Xem thêm",
  lessLabel = "Thu gọn",
  className = "",
}: {
  children: ReactNode;
  moreLabel?: string;
  lessLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const regionId = useId();

  // Measured from a ResizeObserver callback rather than in the effect body:
  // the content's height depends on fonts and images that settle after mount,
  // and a one-shot read would latch the wrong answer.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      // scrollHeight vs the clamp, read off the element's own computed value
      // so the breakpoint-dependent clamp never has to be duplicated in JS.
      const clamp = parseFloat(getComputedStyle(el).getPropertyValue("--clamp-h")) || 0;
      setOverflowing(el.scrollHeight > clamp + 8);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const collapsed = overflowing && !open;

  return (
    <div className={className}>
      <div className="relative">
        <div
          ref={contentRef}
          id={regionId}
          // --clamp-h is defined in globals.css (responsive), and both the
          // measurement above and the max-height below read that one value so
          // they can never disagree about where the cut is.
          className={`v2-clamp transition-[max-height] duration-slow ease-base ${
            collapsed ? "max-h-[var(--clamp-h)] overflow-hidden" : "max-h-none"
          }`}
        >
          {children}
        </div>

        {collapsed && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/85 to-transparent"
          />
        )}
      </div>

      {overflowing && (
        <div className="mt-2 flex justify-center min-[900px]:mt-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={regionId}
            className="inline-flex items-center gap-1 rounded-sm px-3 py-1 text-[11px] font-semibold text-[#880206] transition-colors duration-fast ease-base hover:bg-[#FBEFE3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#880206] wide:text-[14px]"
          >
            {open ? lessLabel : moreLabel}
            <Icon
              name="chevron-right"
              size={12}
              className={`transition-transform duration-fast ease-base ${open ? "-rotate-90" : "rotate-90"}`}
            />
          </button>
        </div>
      )}
    </div>
  );
}
