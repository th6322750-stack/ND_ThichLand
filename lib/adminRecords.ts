import type { AdminPropertyRecord } from "@/lib/types";

/**
 * A record the merge layer could not fully validate. These are published-in-
 * intent but invisible on the public site, so the CMS has to be able to point
 * at exactly this set.
 *
 * The dashboard and the BĐS list both need this predicate and each had its
 * own copy — one written inline in a filter, one as a local function. Drift
 * between them would mean the dashboard's "thiếu dữ liệu" count no longer
 * matched the rows behind ?tt=incomplete.
 */
export function isIncompleteRental(r: AdminPropertyRecord): boolean {
  return r.propertyType === null || r.availability === null || r.price <= 0 || r.area <= 0;
}
