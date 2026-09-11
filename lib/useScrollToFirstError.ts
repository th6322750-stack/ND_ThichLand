"use client";

import { useEffect } from "react";

/**
 * Every admin edit form shows a generic "Vui lòng kiểm tra lại thông tin."
 * banner plus a message under each broken field — but on a form long enough
 * to scroll, that banner doesn't say WHERE the problem is. A client hit
 * exactly this: saved a BĐS listing with the property-type/status dropdowns
 * still unset, saw only the generic banner (visible without scrolling) and
 * had no way to tell what "kiểm tra lại thông tin" meant, since the actual
 * per-field messages were both further down the page, out of view.
 *
 * Scrolls to (and focuses) the first invalid field the instant a save
 * attempt reports one. Relies on the field itself carrying
 * `aria-invalid="true"` — already true for every field routed through
 * FormField, and added directly to BdsForm's own live-preview inputs.
 */
export function useScrollToFirstError(fieldErrors: Record<string, string>) {
  useEffect(() => {
    if (Object.keys(fieldErrors).length === 0) return;
    const el = document.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.focus({ preventScroll: true });
    // fieldErrors is a fresh object on every failed save, including a
    // resubmit that fails on the exact same field(s), so this correctly
    // re-scrolls every time rather than only on the first attempt.
  }, [fieldErrors]);
}
