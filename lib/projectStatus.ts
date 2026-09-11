import type { ProjectStatus } from "./types";

export const KNOWN_PROJECT_STATUSES: ProjectStatus[] = ["Đang triển khai", "Tiêu biểu", "Đã hoàn thành"];

/**
 * The one place a raw string becomes a ProjectStatus.
 *
 * Same never-fabricate rule the rental side already applies to
 * propertyType/availability (lib/server/rental/merge.ts): an empty or
 * unrecognized cell is "unknown" (null), never silently promoted to
 * "Đang triển khai" — a project's build status is a real business fact and
 * must not be invented by a parser. Callers render null as "Đang cập nhật".
 */
export function parseProjectStatus(value: string | undefined): ProjectStatus | null {
  if (!value) return null;
  return (KNOWN_PROJECT_STATUSES as string[]).includes(value) ? (value as ProjectStatus) : null;
}

/** Public display for a status that may be unknown. */
export const PROJECT_STATUS_FALLBACK = "Đang cập nhật";

export function projectStatusLabel(status: ProjectStatus | null): string {
  return status ?? PROJECT_STATUS_FALLBACK;
}
