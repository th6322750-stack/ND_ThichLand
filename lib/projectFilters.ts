import type { ProjectListing, ProjectStatus } from "./types";
import { KNOWN_PROJECT_STATUSES } from "./projectStatus";

/** "" means "Tất cả" — no status narrowing. */
export type ProjectStatusFilter = ProjectStatus | "";

export interface ProjectFilterState {
  q: string;
  location: string;
  status: ProjectStatusFilter;
}

export const EMPTY_PROJECT_FILTERS: ProjectFilterState = { q: "", location: "", status: "" };

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFC");
}

export function matchesProjectQuery(project: ProjectListing, q: string): boolean {
  const needle = normalize(q.trim());
  if (!needle) return true;
  // Wider than the old name-only match: an investor or a summary phrase is
  // just as likely to be what a visitor types.
  return [project.name, project.location, project.investor, project.summary].some((h) =>
    normalize(h ?? "").includes(needle),
  );
}

export function filterProjects<T extends ProjectListing>(projects: T[], filters: ProjectFilterState): T[] {
  return projects.filter((p) => {
    if (filters.status && p.status !== filters.status) return false;
    if (filters.location && p.location !== filters.location) return false;
    if (!matchesProjectQuery(p, filters.q)) return false;
    return true;
  });
}

export function hasActiveProjectFilters(filters: ProjectFilterState): boolean {
  return Boolean(filters.q || filters.location || filters.status);
}

export function getProjectLocationOptions(projects: ProjectListing[]): string[] {
  return Array.from(new Set(projects.map((p) => p.location).filter(Boolean))).sort();
}

const PARAM_KEYS = { q: "q", location: "kv", status: "tt" } as const;

export function projectFiltersToParams(filters: ProjectFilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set(PARAM_KEYS.q, filters.q);
  if (filters.location) params.set(PARAM_KEYS.location, filters.location);
  if (filters.status) params.set(PARAM_KEYS.status, filters.status);
  return params;
}

/** Unknown `?tt=` degrades to "Tất cả" instead of silently matching nothing. */
export function projectFiltersFromParams(params: URLSearchParams): ProjectFilterState {
  const rawStatus = params.get(PARAM_KEYS.status);
  return {
    q: params.get(PARAM_KEYS.q) ?? "",
    location: params.get(PARAM_KEYS.location) ?? "",
    status:
      rawStatus && (KNOWN_PROJECT_STATUSES as string[]).includes(rawStatus) ? (rawStatus as ProjectStatus) : "",
  };
}
