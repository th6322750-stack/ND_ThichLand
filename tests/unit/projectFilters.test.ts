import { describe, it, expect } from "vitest";
import type { ProjectListing } from "@/lib/types";
import {
  EMPTY_PROJECT_FILTERS,
  filterProjects,
  getProjectLocationOptions,
  hasActiveProjectFilters,
  matchesProjectQuery,
  projectFiltersFromParams,
  projectFiltersToParams,
} from "@/lib/projectFilters";
import { parseProjectStatus, projectStatusLabel } from "@/lib/projectStatus";

function project(patch: Partial<ProjectListing>): ProjectListing {
  return {
    slug: "p",
    name: "Dự án",
    location: "Hà Nội",
    mapQuery: "",
    masterplanImage: "",
    showMasterplan: false,
    investor: "NDTHICH",
    status: "Đang triển khai",
    media: [],
    summary: "",
    amenities: [],
    progressText: "",
    progressPercent: 0,
    progressPhotos: [],
    unitTypes: [],
    propertyType: "",
    scale: "",
    unitCount: "",
    highlights: [],
    ...patch,
  };
}

describe("filterProjects", () => {
  const projects = [
    project({ slug: "a", name: "Sun Galaxy", location: "Quận 7", status: "Đang triển khai" }),
    project({ slug: "b", name: "Riverside", location: "Thủ Đức", status: "Đã hoàn thành" }),
    project({ slug: "c", name: "Office Tower", location: "Quận 7", status: null, investor: "ABC Corp" }),
  ];

  it("narrows by status, and a project with unknown status never matches a status tab", () => {
    expect(filterProjects(projects, { ...EMPTY_PROJECT_FILTERS, status: "Đang triển khai" }).map((p) => p.slug)).toEqual([
      "a",
    ]);
    expect(filterProjects(projects, { ...EMPTY_PROJECT_FILTERS, status: "Đã hoàn thành" }).map((p) => p.slug)).toEqual([
      "b",
    ]);
  });

  it("keeps unknown-status projects visible under Tất cả", () => {
    expect(filterProjects(projects, EMPTY_PROJECT_FILTERS)).toHaveLength(3);
  });

  it("narrows by location and combines with the keyword", () => {
    const result = filterProjects(projects, { ...EMPTY_PROJECT_FILTERS, location: "Quận 7", q: "office" });
    expect(result.map((p) => p.slug)).toEqual(["c"]);
  });

  // The old inline filter only looked at `name`, so searching an investor or
  // a phrase from the summary silently returned nothing.
  it("matches investor and summary text, not just the name", () => {
    expect(matchesProjectQuery(projects[2]!, "abc corp")).toBe(true);
    expect(matchesProjectQuery(project({ summary: "ven sông Sài Gòn" }), "ven sông")).toBe(true);
    expect(matchesProjectQuery(projects[0]!, "khong-ton-tai")).toBe(false);
  });

  it("reports active filters and lists real locations only", () => {
    expect(hasActiveProjectFilters(EMPTY_PROJECT_FILTERS)).toBe(false);
    expect(hasActiveProjectFilters({ ...EMPTY_PROJECT_FILTERS, q: "x" })).toBe(true);
    expect(getProjectLocationOptions(projects)).toEqual(["Quận 7", "Thủ Đức"]);
  });
});

describe("project filter URL state", () => {
  it("round-trips and omits empty values", () => {
    const params = projectFiltersToParams({ q: "sun", location: "Quận 7", status: "Đã hoàn thành" });
    expect(params.toString()).toContain("tt=");
    expect(projectFiltersFromParams(params)).toEqual({ q: "sun", location: "Quận 7", status: "Đã hoàn thành" });
    expect(projectFiltersToParams(EMPTY_PROJECT_FILTERS).toString()).toBe("");
  });

  it("degrades an unknown status param to Tất cả instead of matching nothing", () => {
    expect(projectFiltersFromParams(new URLSearchParams("tt=Sắp%20mở%20bán")).status).toBe("");
  });
});

describe("parseProjectStatus", () => {
  // The repository used to coerce an empty/unknown cell to "Đang triển
  // khai", inventing a build-status fact for the public page.
  it("never fabricates a status", () => {
    expect(parseProjectStatus("")).toBeNull();
    expect(parseProjectStatus(undefined)).toBeNull();
    expect(parseProjectStatus("Sắp mở bán")).toBeNull();
    expect(parseProjectStatus("Đang triển khai")).toBe("Đang triển khai");
  });

  it("renders an unknown status as the shared fallback copy", () => {
    expect(projectStatusLabel(null)).toBe("Đang cập nhật");
    expect(projectStatusLabel("Tiêu biểu")).toBe("Tiêu biểu");
  });
});
