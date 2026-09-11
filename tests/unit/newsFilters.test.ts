import { describe, it, expect } from "vitest";
import { news } from "@/lib/data/news";
import {
  EMPTY_NEWS_FILTERS,
  filterNews,
  newsFiltersFromParams,
  newsFiltersToParams,
} from "@/lib/newsFilters";

describe("filterNews", () => {
  it("returns everything for empty filters", () => {
    expect(filterNews(news, EMPTY_NEWS_FILTERS)).toHaveLength(news.length);
  });

  it("filters by category", () => {
    const result = filterNews(news, { ...EMPTY_NEWS_FILTERS, category: "Kinh nghiệm" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((a) => a.category === "Kinh nghiệm")).toBe(true);
  });

  it("filters by text query across title/excerpt/section headings", () => {
    const result = filterNews(news, { ...EMPTY_NEWS_FILTERS, q: "checklist" });
    expect(result.length).toBeGreaterThan(0);
  });

  it("combines category and query — narrower than either alone", () => {
    const byCategory = filterNews(news, { ...EMPTY_NEWS_FILTERS, category: "Kinh nghiệm" });
    const combined = filterNews(news, { q: "khong-ton-tai-xyz", category: "Kinh nghiệm" });
    expect(combined.length).toBeLessThanOrEqual(byCategory.length);
    expect(combined).toHaveLength(0);
  });
});

describe("news URL param round-trip", () => {
  it("round-trips q/category/page", () => {
    const filters = { q: "thue", category: "Dự án" };
    const params = newsFiltersToParams(filters, 2);
    const parsed = newsFiltersFromParams(params);
    expect(parsed.filters).toEqual(filters);
    expect(parsed.page).toBe(2);
  });

  it("omits page=1 and empty fields", () => {
    const params = newsFiltersToParams(EMPTY_NEWS_FILTERS, 1);
    expect(params.toString()).toBe("");
  });
});
