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
export function useRentalFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { filters, page } = useMemo(() => rentalFiltersFromParams(searchParams), [searchParams]);

  const push = useCallback(
    (nextFilters: RentalFilterState, nextPage: number) => {
      const qs = rentalFiltersToParams(nextFilters, nextPage).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const setFilters = useCallback(
    (patch: Partial<RentalFilterState>) => push({ ...filters, ...patch }, 1),
    [filters, push],
  );

  const setPage = useCallback((nextPage: number) => push(filters, nextPage), [filters, push]);

  const reset = useCallback(() => push(EMPTY_RENTAL_FILTERS, 1), [push]);

  return { filters, page, setFilters, setPage, reset };
}
