import type { NewsArticle } from "./types";

export interface NewsFilterState {
  q: string;
  category: string;
}

export const EMPTY_NEWS_FILTERS: NewsFilterState = { q: "", category: "" };

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFC");
}

export function matchesNewsQuery(article: NewsArticle, q: string): boolean {
  const needle = normalize(q.trim());
  if (!needle) return true;
  const haystacks = [article.title, article.category, article.excerpt, ...article.sections.map((s) => s.heading)];
  return haystacks.some((h) => normalize(h).includes(needle));
}

export function filterNews(articles: NewsArticle[], filters: NewsFilterState): NewsArticle[] {
  return articles.filter((a) => {
    if (filters.category && a.category !== filters.category) return false;
    return matchesNewsQuery(a, filters.q);
  });
}

const PARAM_KEYS = { q: "q", category: "category", page: "page" } as const;

export function newsFiltersToParams(filters: NewsFilterState, page: number): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set(PARAM_KEYS.q, filters.q);
  if (filters.category) params.set(PARAM_KEYS.category, filters.category);
  if (page > 1) params.set(PARAM_KEYS.page, String(page));
  return params;
}

export function newsFiltersFromParams(params: URLSearchParams): { filters: NewsFilterState; page: number } {
  return {
    filters: {
      q: params.get(PARAM_KEYS.q) ?? "",
      category: params.get(PARAM_KEYS.category) ?? "",
    },
    page: Math.max(1, Number(params.get(PARAM_KEYS.page)) || 1),
  };
}
