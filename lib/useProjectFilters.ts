"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  EMPTY_PROJECT_FILTERS,
  projectFiltersFromParams,
  projectFiltersToParams,
  type ProjectFilterState,
} from "@/lib/projectFilters";

/**
 * /du-an discovery state in the URL, same contract as useRentalFilters:
 * reloading, sharing or bookmarking a filtered project list keeps the
 * filter. Previously these three controls lived in useState, so a shared
 * /du-an link always dropped the visitor back on the unfiltered list.
 *
 * router.replace (not push) so typing in the search box doesn't create one
 * history entry per keystroke.
 */
export function useProjectFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(() => projectFiltersFromParams(searchParams), [searchParams]);

  const push = useCallback(
    (next: ProjectFilterState) => {
      const qs = projectFiltersToParams(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const setFilters = useCallback(
    (patch: Partial<ProjectFilterState>) => push({ ...filters, ...patch }),
    [filters, push],
  );

  const reset = useCallback(() => push(EMPTY_PROJECT_FILTERS), [push]);

  return { filters, setFilters, reset };
}
