/**
 * Feature detection for the two browser APIs the scroll/entrance effects
 * depend on.
 *
 * Both are optional enhancements, so a missing API must degrade to "show the
 * content, skip the animation" — never throw. Without these guards a
 * renderer that lacks `matchMedia` or `IntersectionObserver` (jsdom, older
 * embedded webviews, some in-app browsers) crashes the whole component tree
 * instead of just missing a fade.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True when an entrance animation should run at all. */
export function canAnimateOnScroll(): boolean {
  return typeof window !== "undefined" && !prefersReducedMotion();
}

/** Reveal once the element's top passes this fraction of the viewport. */
const TRIGGER_RATIO = 0.92;

type Watcher = { el: Element; onReveal: () => void };

const watchers = new Set<Watcher>();
let frame = 0;
let listening = false;

function flush() {
  frame = 0;
  const limit = window.innerHeight * TRIGGER_RATIO;
  for (const watcher of [...watchers]) {
    const rect = watcher.el.getBoundingClientRect();
    // `top < limit` covers scrolling down into view AND the element already
    // being above the viewport (negative top) after a jump.
    if (rect.top < limit) {
      watchers.delete(watcher);
      watcher.onReveal();
    }
  }
  if (watchers.size === 0) stopListening();
}

function schedule() {
  if (frame) return;
  frame = requestAnimationFrame(flush);
}

function startListening() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
}

function stopListening() {
  if (!listening) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
}

/**
 * Calls `onReveal` once, as soon as `el` has reached the trigger line.
 *
 * Deliberately NOT IntersectionObserver. IO only reports threshold
 * *crossings*, so when the viewport jumps straight past a block — scroll
 * restoration on reload, an #anchor jump, the End key, a programmatic
 * scrollTo — the ratio goes 0 -> 0, no callback ever fires, and the block
 * stays hidden. A position check on scroll is unconditionally correct for
 * both gradual and jumped scrolling.
 *
 * All watchers share ONE rAF-throttled scroll/resize listener, which is
 * removed again as soon as the last one has fired.
 */
export function watchForReveal(el: Element, onReveal: () => void): () => void {
  const watcher: Watcher = { el, onReveal };
  watchers.add(watcher);
  startListening();
  // Covers the case where it is already past the line at registration time.
  schedule();
  return () => {
    watchers.delete(watcher);
    if (watchers.size === 0) stopListening();
  };
}
