"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  EMPTY_RENTAL_FILTERS,
  rentalFiltersFromParams,
  rentalFiltersToParams,
  type RentalFilterState,
} from "@/lib/rentalFilters";

/**
 * Shared rental discovery state, persisted to the URL (q/location/type/price/area/page)
 * so /cho-thue survives reload and is deep-linkable from the homepage SearchPanel.
 * Uses router.replace (not push) so typing in search / toggling filters doesn't spam
 * browser history — back/forward still works for actual page-to-page navigation.
 */
// Every key rentalFiltersToParams is responsible for. A key in this set that
// is absent from the newly built params was deliberately cleared, so it must
// not be resurrected from the previous URL.
const OWNED_PARAMS = new Set([
  "q",
  "location",
  "type",
  "pn",
  "sort",
  "price",
  "area",
  "priceMin",
  "priceMax",
  "areaMin",
  "areaMax",
  "page",
]);

export function useRentalFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { filters, page } = useMemo(() => rentalFiltersFromParams(searchParams), [searchParams]);

  const push = useCallback(
    (nextFilters: RentalFilterState, nextPage: number) => {
      const next = rentalFiltersToParams(nextFilters, nextPage);
      // Carry over any param this module does not own — notably `luu=1`, the
      // saved-listings view. Rebuilding the query string from the filter
      // state alone silently dropped it, so changing any filter while
      // browsing "Yêu thích" kicked the visitor back to the full list.
      for (const [key, value] of searchParams.entries()) {
        if (!next.has(key) && !OWNED_PARAMS.has(key)) next.set(key, value);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setFilters = useCallback(
    (patch: Partial<RentalFilterState>) => push({ ...filters, ...patch }, 1),
    [filters, push],
  );

  const setPage = useCallback((nextPage: number) => push(filters, nextPage), [filters, push]);

  const reset = useCallback(() => push(EMPTY_RENTAL_FILTERS, 1), [push]);

  return { filters, page, setFilters, setPage, reset };
}
