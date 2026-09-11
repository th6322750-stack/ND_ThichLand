"use client";

import { useReportWebVitals } from "next/web-vitals";
import { sendGAEvent } from "@next/third-parties/google";

/**
 * Only mounted when GA4 is actually configured (see app/layout.tsx) — there
 * is nowhere else these metrics would go. Reports LCP/INP/CLS/FCP/TTFB, the
 * Core Web Vitals Google's own ranking signal is built from, so a real
 * regression (a bloated hero image, a layout-shifting embed) shows up as
 * data instead of only as a guess from someone eyeballing the page.
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // CLS is a unitless fraction (e.g. 0.023) — GA4 events want integers,
    // so it's scaled the same way GA's own examples do. Every other metric
    // is already a millisecond duration and stays as-is.
    const value = metric.name === "CLS" ? Math.round(metric.value * 1000) : Math.round(metric.value);
    sendGAEvent("event", metric.name, {
      value,
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      // Keeps these from skewing GA4's engagement/bounce-rate metrics —
      // they fire on every page load, not from something the visitor did.
      non_interaction: true,
    });
  });

  return null;
}
