"use client";

import { useMemo, useState } from "react";
import { NewsCard } from "@/components/public/NewsCard";
import { Pagination } from "@/components/public/Pagination";
import { Icon } from "@/components/icons";
import { news } from "@/lib/data/news";

const CATEGORIES = ["Cho thuê", "Dự án", "Kinh nghiệm"];
const PAGE_SIZE = 6;

export default function TinTucPage() {
  const [category, setCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => (category ? news.filter((n) => n.category === category) : news),
    [category],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
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
              placeholder="Tìm bài viết..."
              className="w-full bg-transparent text-body text-ink outline-none placeholder:text-muted"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCategory((current) => (current === c ? null : c));
                  setPage(1);
                }}
                aria-pressed={category === c}
                className={`rounded-full px-4 py-2 text-label ${
                  category === c ? "bg-primary text-surface" : "bg-surface text-ink"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
          {visible.map((article) => (
            <NewsCard key={article.slug} article={article} />
          ))}
        </div>

        <div className="mt-10">
          <Pagination page={page} total={totalPages} onChange={setPage} />
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-md bg-soft p-8 desktop:flex-row desktop:items-center">
          <div>
            <h2 className="text-h2-mobile text-ink desktop:text-h2">Theo dõi nội dung mới</h2>
            <p className="mt-2 text-body text-body">
              Tin tức là module CMS riêng; card, ảnh và typography đã khóa.
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
    </>
  );
}
