"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { canAnimateOnScroll, watchForReveal } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  /** Stagger within a group, in ms. Keep under ~240ms — beyond that a
      section reads as "loading" rather than "arriving". */
  delay?: number;
  className?: string;
  /** Renders as this element so a reveal wrapper never breaks semantics
      (e.g. a <section> stays a <section>, a grid child stays a grid child). */
  as?: ElementType;
  /** Everything else (notably the data-qa-region markers the QA suites
      select on) is forwarded to the rendered element — dropping them here
      would silently break those selectors. */
  [key: `data-${string}`]: unknown;
  id?: string;
}

/**
 * Fades + lifts a block into place the first time it scrolls into view.
 *
 * Safety rule this is built around: content must NEVER be able to get stuck
 * invisible. So the server (and the pre-hydration client) renders it fully
 * visible with no reveal classes at all. Only on mount, and only for blocks
 * that are still BELOW the fold, does it arm itself — hide, observe, then
 * reveal. Anything already on screen simply stays visible and never
 * animates, which also avoids a flash of the hero area re-animating.
 *
 * With JS disabled, prefers-reduced-motion on, or if hydration never
 * happens, every block just renders normally.
 */
export function Reveal({ children, delay = 0, className = "", as: Tag = "div", ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !canAnimateOnScroll()) return;

    // Already visible (or nearly) — leave it alone rather than hiding
    // something the visitor can currently see.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    setArmed(true);
    return watchForReveal(el, () => setShown(true));
  }, []);

  const motion = !armed
    ? ""
    : shown
      ? "translate-y-0 opacity-100"
      : "translate-y-[18px] opacity-0";

  return (
    <Tag
      {...rest}
      ref={ref}
      style={armed && delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`${armed ? "transition-[opacity,transform] duration-slow ease-base will-change-[opacity,transform]" : ""} ${motion} ${className}`}
    >
      {children}
    </Tag>
  );
}
