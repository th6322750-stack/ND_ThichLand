import { prefersReducedMotion } from "./motion";

/**
 * Wheel-driven smooth scrolling with inertia.
 *
 * Why this exists: a mouse wheel on Windows/Linux emits discrete ~100px
 * jumps. The page teleports one notch per notch, which is the "khựng khựng"
 * stutter — no amount of CSS easing on the elements can fix it, because the
 * scroll position itself is stepping. Interpolating toward the wheel target
 * turns those steps into one continuous glide, and every scroll-driven
 * animation on the page inherits that smoothness for free.
 *
 * Scope is deliberately narrow, which is what keeps it safe:
 *  - It only intercepts the WHEEL. Touch keeps native inertia (already
 *    excellent, and hijacking it is where smooth-scroll libraries usually
 *    break iOS). Keyboard, scrollbar dragging, anchor jumps and focus
 *    scrolling all stay native and are simply re-synced.
 *  - It drives the real `window.scrollTo`, so position: sticky, the URL bar,
 *    scroll-driven CSS animations and scroll restoration all keep working —
 *    unlike transform-based fake scrolling.
 *  - It bails whenever the wheel is over something else that can scroll, so
 *    modals, drawers and overflow panes behave normally.
 */

// Fraction of the remaining distance covered per 60fps frame. Lower = longer,
// softer glide. 0.11 lands just short of a quarter second to settle, which
// reads as momentum without feeling laggy or detached from the input.
const LERP = 0.11;
const FRAME_MS = 1000 / 60;
// Below this the remainder is imperceptible; snapping avoids an endless tail
// of sub-pixel rAF frames.
const SNAP_PX = 0.4;

function maxScroll(): number {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

/** Wheel deltas arrive in pixels, lines or pages depending on the device. */
function normalizeDelta(event: WheelEvent): number {
  if (event.deltaMode === 1) return event.deltaY * 16; // lines
  if (event.deltaMode === 2) return event.deltaY * window.innerHeight; // pages
  return event.deltaY;
}

/**
 * True when something between the wheel target and <body> can absorb this
 * scroll itself — a drawer, a modal body, an overflow-x strip. Those must
 * keep native behaviour.
 */
function hasScrollableAncestor(start: EventTarget | null, delta: number): boolean {
  let node = start instanceof Element ? start : null;
  while (node && node !== document.body && node !== document.documentElement) {
    const style = getComputedStyle(node);
    const overflowY = style.overflowY;
    const scrollable =
      (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
      node.scrollHeight > node.clientHeight + 1;
    if (scrollable) {
      const atTop = node.scrollTop <= 0;
      const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
      // Only defer if it can actually move in the requested direction;
      // otherwise the page should continue scrolling past it.
      if ((delta < 0 && !atTop) || (delta > 0 && !atBottom)) return true;
    }
    node = node.parentElement;
  }
  return false;
}

export function installSmoothScroll(): () => void {
  if (typeof window === "undefined") return () => {};

  // Touch devices already have real inertia; and a fine pointer is the only
  // case where discrete wheel steps are the problem.
  const coarsePointer = typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
  if (coarsePointer || prefersReducedMotion()) return () => {};

  let target = window.scrollY;
  let current = window.scrollY;
  let rafId = 0;
  let animating = false;
  let lastTime = 0;
  // How far the real scroll position may drift from ours during a glide
  // before we treat it as someone else driving (scrollbar drag mid-glide).
  const DIVERGENCE_PX = 40;

  const stop = () => {
    animating = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  };

  const step = (time: number) => {
    if (!animating) return;
    const dt = lastTime ? Math.min(64, time - lastTime) : FRAME_MS;
    lastTime = time;

    // Frame-rate independent easing: the same glide on 60Hz and 144Hz.
    const factor = 1 - Math.pow(1 - LERP, dt / FRAME_MS);
    current += (target - current) * factor;

    if (Math.abs(target - current) < SNAP_PX) {
      current = target;
      window.scrollTo(0, current);
      stop();
      return;
    }

    window.scrollTo(0, current);
    rafId = requestAnimationFrame(step);
  };

  const start = () => {
    if (animating) return;
    animating = true;
    lastTime = 0;
    rafId = requestAnimationFrame(step);
  };

  const onWheel = (event: WheelEvent) => {
    // Pinch-zoom and browser-level gestures.
    if (event.ctrlKey || event.metaKey || event.defaultPrevented) return;
    // A drawer/sheet has locked the page; let it be.
    if (document.body.style.overflow === "hidden") return;

    const delta = normalizeDelta(event);
    if (!delta) return;
    if (hasScrollableAncestor(event.target, delta)) return;

    const limit = maxScroll();
    if (limit <= 0) return;

    // At the very edge with nowhere to go: stay out of the way so overscroll
    // and pull-to-refresh style behaviours still work.
    const atEdge = (delta < 0 && target <= 0) || (delta > 0 && target >= limit);
    if (atEdge) return;

    event.preventDefault();
    target = Math.min(limit, Math.max(0, target + delta));
    start();
  };

  // Anything that moved the page other than us — scrollbar drag, keyboard,
  // anchor jump, focus, scroll restoration — becomes the new truth.
  //
  // Compared by POSITION rather than an "is this ours?" flag. A flag desyncs
  // the moment one of our own scrollTo calls lands on the position the page
  // is already at: no scroll event fires, the flag stays armed, and it then
  // swallows the next genuine scroll instead. That silently broke anchor
  // links and any programmatic scrollTo, which snapped straight back.
  const onScroll = () => {
    const y = window.scrollY;
    if (animating) {
      // During a glide our own writes keep y within a pixel of `current`;
      // anything larger means someone else took over.
      if (Math.abs(y - current) > DIVERGENCE_PX) {
        stop();
        target = y;
        current = y;
      }
      return;
    }
    target = y;
    current = y;
  };

  const onResize = () => {
    const limit = maxScroll();
    target = Math.min(target, limit);
    current = Math.min(current, limit);
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });

  return () => {
    stop();
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
  };
}
