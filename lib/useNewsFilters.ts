"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EMPTY_NEWS_FILTERS, newsFiltersFromParams, newsFiltersToParams, type NewsFilterState } from "@/lib/newsFilters";

export function useNewsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { filters, page } = useMemo(() => newsFiltersFromParams(searchParams), [searchParams]);

  const push = useCallback(
    (nextFilters: NewsFilterState, nextPage: number) => {
      const qs = newsFiltersToParams(nextFilters, nextPage).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const setFilters = useCallback(
    (patch: Partial<NewsFilterState>) => push({ ...filters, ...patch }, 1),
    [filters, push],
  );

  const setPage = useCallback((nextPage: number) => push(filters, nextPage), [filters, push]);

  const reset = useCallback(() => push(EMPTY_NEWS_FILTERS, 1), [push]);

  return { filters, page, setFilters, setPage, reset };
}
