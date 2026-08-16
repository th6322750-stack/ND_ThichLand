"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { canAnimateOnScroll, watchForReveal } from "@/lib/motion";

// useLayoutEffect warns during SSR; this picks the effect that runs before
// paint on the client without tripping that warning on the server.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const DURATION_MS = 1100;

/** Splits "500+" / "100%" / "24/7" into the leading number and its
    surrounding text, so any of them can animate without hardcoding formats. */
function parseValue(value: string): { prefix: string; target: number; suffix: string } | null {
  const match = /^(\D*)(\d+)(.*)$/.exec(value);
  if (!match) return null;
  return { prefix: match[1], target: Number(match[2]), suffix: match[3] };
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Counts a metric up from zero the first time it scrolls into view.
 *
 * The final value is what renders on the server, so with JS off or
 * prefers-reduced-motion on the real number is simply there. The reset to
 * zero happens in a layout effect (before the browser paints), so a metric
 * that is already on screen never flashes its final value first.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const parsed = parseValue(value);
  const ref = useRef<HTMLParagraphElement>(null);
  const [display, setDisplay] = useState(value);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    // No parseable number, no observer support, or reduced motion: the final
    // value is already rendered, so there is simply nothing to do.
    if (!el || !parsed || !canAnimateOnScroll()) return;

    const { prefix, target, suffix } = parsed;
    setDisplay(`${prefix}0${suffix}`);

    let frame = 0;
    let start = 0;
    const run = (now: number) => {
      if (!start) start = now;
      const progress = Math.min(1, (now - start) / DURATION_MS);
      setDisplay(`${prefix}${Math.round(easeOutCubic(progress) * target)}${suffix}`);
      if (progress < 1) frame = requestAnimationFrame(run);
    };

    const unwatch = watchForReveal(el, () => {
      frame = requestAnimationFrame(run);
    });

    return () => {
      unwatch();
      cancelAnimationFrame(frame);
    };
    // `value` is the only real input; `parsed` is derived from it each render.
  }, [value]);

  return (
    <p ref={ref} className={className}>
      {/* tabular-nums keeps the width stable while the digits change, so the
          row doesn't jitter as 0 -> 500 gains characters. */}
      <span className="tabular-nums">{display}</span>
    </p>
  );
}
