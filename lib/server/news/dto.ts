import type { NewsArticle } from "@/lib/types";
import type { NewsRecord } from "./repository";

export function toPublicNewsArticle(record: NewsRecord): NewsArticle {
  return {
    slug: record.slug,
    title: record.title,
    category: record.category,
    publishedAt: record.publishedAt,
    readMinutes: record.readMinutes,
    excerpt: record.excerpt,
    sections: record.sections,
    cover: record.cover,
  };
}

export function toPublicNewsArticles(records: NewsRecord[]): NewsArticle[] {
  return records.filter((r) => r.published).map(toPublicNewsArticle);
}
