"use client";

import { useEffect } from "react";
import { installSmoothScroll } from "@/lib/smoothScroll";

/**
 * Installs wheel inertia for the public site. Renders nothing.
 *
 * Mounted in the public-v2 layout only — the CMS is a data tool where an
 * operator scanning long tables wants the scroll position to land exactly
 * where they put it, not glide.
 */
export function SmoothScroll() {
  useEffect(() => installSmoothScroll(), []);
  return null;
}
