"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/icons";

interface MediaItem {
  id?: string;
  filename: string;
  src: string;
  kind: "Ảnh" | "Video";
}

interface MediaGridProps {
  items: MediaItem[];
  onDelete?: (item: MediaItem) => void;
}

const FILTERS = ["Tất cả", "Ảnh", "Video"] as const;

export function MediaGrid({ items, onDelete }: MediaGridProps) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Tất cả");
  // The search box was a placeholder-only input with no state and no handler.
  // Filtering by filename is the whole feature, so it is wired up rather than
  // removed.
  const [query, setQuery] = useState("");

  const needle = query.trim().toLowerCase();
  const visible = items.filter(
    (item) =>
      (filter === "Tất cả" || item.kind === filter) &&
      (!needle || item.filename.toLowerCase().includes(needle)),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-md bg-soft p-4 tablet:flex-row tablet:items-center tablet:justify-between">
        <div className="flex items-center gap-3">
          <Icon name="search" size={18} className="shrink-0 opacity-50" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên tệp..."
            aria-label="Tìm theo tên tệp"
            className="w-full bg-transparent text-body text-ink outline-none placeholder:text-muted tablet:w-[256px]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`rounded-full px-4 py-2 text-label transition-colors duration-fast ease-base ${
                filter === f
                  ? "bg-primary text-surface"
                  : "bg-surface text-body hover:text-primary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-md border border-line bg-surface p-16 text-center text-body text-muted">
          {items.length === 0
            ? "Chưa có media nào. Tải ảnh hoặc dán link để bắt đầu."
            : "Không có media nào khớp bộ lọc hiện tại."}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 tablet:grid-cols-3 desktop:grid-cols-4">
          {visible.map((item) => (
            <div
              key={item.id ?? item.filename}
              className="group overflow-hidden rounded-md border border-line bg-surface transition-[border-color,box-shadow] duration-fast ease-base hover:border-primary hover:shadow-v2-premium"
            >
              <div className="relative aspect-[4/3]">
                <Image src={item.src} alt="" fill className="object-cover" unoptimized />
                {/* Was a constant "Media" pill on every tile — on the Media
                    page. The item's own kind is the part worth showing. */}
                <span className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-label text-surface backdrop-blur-[2px]">
                  {item.kind}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete?.(item)}
                  aria-label={`Xóa ${item.filename}`}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 transition-colors duration-fast ease-base hover:bg-surface"
                >
                  <Icon name="trash" size={16} aria-hidden />
                </button>
              </div>
              <div className="p-3">
                <p title={item.filename} className="truncate text-body font-bold text-ink">
                  {item.filename}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
