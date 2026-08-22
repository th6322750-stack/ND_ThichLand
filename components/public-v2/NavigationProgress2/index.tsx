"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Feedback for in-app navigations, replacing the route `loading.tsx`
 * skeletons that used to sit here.
 *
 * Those skeletons swapped the whole page body out the moment a link was
 * clicked. Measured on / -> /cho-thue over a throttled connection, the
 * skeleton was on screen for a single ~60ms frame before a blank frame and
 * then the real content — a flash of empty layout rather than a loading
 * state, and the document collapsed 3401px -> 900px on the way, snapping the
 * footer up under the header.
 *
 * With no loading.tsx, Next keeps the current page mounted until the next one
 * is ready. Nothing collapses and nothing flashes; this component supplies
 * the missing signal instead — a top progress bar plus a dimming of the page
 * body (see `[data-navigating]` in globals.css).
 */
export function NavigationProgress2() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // The URL the visitor was on when they clicked. Pending is derived from it
  // rather than cleared in an effect: the moment the router commits, this key
  // changes and the comparison below flips on its own.
  const currentKey = `${pathname}?${searchParams}`;
  const [leavingKey, setLeavingKey] = useState<string | null>(null);
  const pending = leavingKey !== null && leavingKey === currentKey;

  // A link click starts the indicator. Next gives no global "navigation
  // started" event, and useLinkStatus only reports for the one Link it sits
  // inside, so this listens where every navigation actually begins.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      // Let the browser handle anything that is not a plain left-click
      // in-app navigation. `defaultPrevented` is deliberately NOT checked:
      // next/link calls preventDefault() from React's own delegated handler,
      // which runs before this one, so testing it here would reject every
      // single in-app navigation — which is exactly what it did.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || anchor.hasAttribute("download") || anchor.target === "_blank") return;

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same page, or a pure hash jump — no navigation to wait for.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      setLeavingKey(`${window.location.pathname}?${window.location.search.replace(/^\?/, "")}`);
    }

    // Capture phase, so this sees the click before React's delegated handler
    // marks it handled.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // A navigation that never commits (an aborted prefetch, a route that
  // throws) must not leave the page dimmed forever.
  useEffect(() => {
    if (!pending) return;
    const timeout = setTimeout(() => setLeavingKey(null), 8000);
    return () => clearTimeout(timeout);
  }, [pending]);

  useEffect(() => {
    if (pending) {
      document.body.setAttribute("data-navigating", "true");
    } else {
      document.body.removeAttribute("data-navigating");
    }
    return () => document.body.removeAttribute("data-navigating");
  }, [pending]);

  if (!pending) return null;

  return (
    <div
      // aria-hidden: the bar is decorative, the status message below is what
      // a screen reader should hear.
      className="pointer-events-none fixed inset-x-0 top-0 z-toast h-[3px] overflow-hidden"
      aria-hidden="true"
    >
      <div className="v2-nav-progress h-full bg-[#880206]" />
    </div>
  );
}
