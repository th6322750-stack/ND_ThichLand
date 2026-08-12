"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/icons";

interface MediaItem {
  filename: string;
  src: string;
  kind: "Ảnh" | "Video";
}

interface MediaGridProps {
  items: MediaItem[];
}

const FILTERS = ["Tất cả", "Ảnh", "Video"] as const;

export function MediaGrid({ items }: MediaGridProps) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Tất cả");
  const visible = filter === "Tất cả" ? items : items.filter((item) => item.kind === filter);

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-md bg-soft p-4 tablet:flex-row tablet:items-center tablet:justify-between">
        <div className="flex items-center gap-3">
          <Icon name="search" size={18} className="text-muted" />
          <input
            type="search"
            placeholder="Tìm media..."
            className="w-full bg-transparent text-body text-ink outline-none placeholder:text-muted tablet:w-64"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`rounded-full px-4 py-2 text-label ${
                filter === f ? "bg-primary text-surface" : "bg-surface text-ink"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 tablet:grid-cols-3 desktop:grid-cols-4">
        {visible.map((item) => (
          <div key={item.filename} className="rounded-md border border-line bg-surface">
            <div className="relative aspect-[4/3]">
              <Image src={item.src} alt="" fill className="rounded-t-md object-cover" unoptimized />
              <span className="absolute left-3 top-3 rounded-full bg-black/40 px-3 py-1 text-label text-surface">
                Media
              </span>
              <button
                type="button"
                aria-label={`Xóa ${item.filename}`}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-error hover:bg-surface"
              >
                <Icon name="trash" size={16} />
              </button>
            </div>
            <div className="p-3">
              <p className="truncate text-body font-bold text-ink">{item.filename}</p>
              <p className="text-body text-muted">{item.kind} • CMS</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
