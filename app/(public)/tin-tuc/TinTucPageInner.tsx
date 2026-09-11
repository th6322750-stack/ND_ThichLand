"use client";

import { useMemo } from "react";
import { NewsCard } from "@/components/public/NewsCard";
import { EmptySearchResults } from "@/components/public/EmptySearchResults";
import { Pagination } from "@/components/public/Pagination";
import { Icon } from "@/components/icons";
import { useNewsFilters } from "@/lib/useNewsFilters";
import { filterNews } from "@/lib/newsFilters";
import type { NewsArticle } from "@/lib/types";

const PAGE_SIZE = 6;

export function TinTucPageInner({ articles }: { articles: NewsArticle[] }) {
  const { filters, page, setFilters, setPage, reset } = useNewsFilters();

  // Derived from the articles that actually exist. The chips used to be a
  // hardcoded ["Cho thuê", "Dự án", "Kinh nghiệm"] list that did not match
  // the real categories, so two of the three always produced zero results
  // and the categories that DID exist had no chip at all.
  const categories = useMemo(
    () => Array.from(new Set(articles.map((a) => a.category).filter(Boolean))).sort(),
    [articles],
  );
  const filtered = useMemo(() => filterNews(articles, filters), [articles, filters]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  );

  return (
    <div className="container-page py-10">
      <h1 className="text-h1-mobile text-ink desktop:text-h1">Tin tức &amp; kinh nghiệm</h1>
      <p className="mt-2 text-body text-muted">
        Nội dung giúp khách hiểu rõ hơn trước khi thuê hoặc quan tâm dự án.
      </p>

      <div className="mt-8 flex flex-col items-start gap-4 rounded-md bg-soft p-4 tablet:flex-row tablet:items-center tablet:justify-between">
        <div className="flex w-full items-center gap-3 tablet:max-w-sm">
          <Icon name="search" size={18} className="text-muted" />
          <input
            type="search"
            value={filters.q}
            onChange={(e) => setFilters({ q: e.target.value })}
            placeholder="Tìm bài viết..."
            aria-label="Tìm bài viết"
            className="w-full bg-transparent text-body text-ink outline-none placeholder:text-muted"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilters({ category: filters.category === c ? "" : c })}
              aria-pressed={filters.category === c}
              className={`rounded-full px-4 py-2 text-label transition-colors duration-fast ease-base ${
                filters.category === c ? "bg-primary text-surface" : "bg-surface text-ink hover:text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptySearchResults
            title="Không tìm thấy bài viết phù hợp?"
            message="Thử từ khóa khác hoặc bỏ bớt bộ lọc chuyên mục."
            resetLabel="Xóa bộ lọc"
            onReset={reset}
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
          {visible.map((article, i) => (
            <NewsCard key={article.slug} article={article} priority={i === 0} />
          ))}
        </div>
      )}

      <div className="mt-10">
        <Pagination page={safePage} total={totalPages} onChange={setPage} />
      </div>

      <div className="mt-[56px] flex flex-col items-start justify-between gap-6 rounded-md bg-soft p-8 desktop:flex-row desktop:items-center">
        <div>
          <h2 className="text-h2-mobile text-ink desktop:text-h2">Theo dõi nội dung mới</h2>
          <p className="mt-2 text-body text-body">
            Gọi ngay để được tư vấn nhanh về nhà, căn hộ và mặt bằng đang cho thuê.
          </p>
        </div>
        <a
          href="tel:0986602203"
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
        >
          <Icon name="phone" size={16} className="invert" /> Liên hệ NDTHICH
        </a>
      </div>
    </div>
  );
}
