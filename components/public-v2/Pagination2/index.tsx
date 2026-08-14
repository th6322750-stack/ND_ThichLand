"use client";

import { Icon } from "@/components/icons";

interface Pagination2Props {
  page: number;
  total: number;
  onChange: (page: number) => void;
}

// Compact numbered pagination with a "…" gap for long ranges, matching
// 02_ChoThue_WEB.png (‹ 1 2 3 4 5 … 8 ›).
export function Pagination2({ page, total, onChange }: Pagination2Props) {
  if (total <= 1) return null;

  const pages: (number | "gap")[] = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - page) <= 1) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "gap") {
      pages.push("gap");
    }
  }

  return (
    <nav aria-label="Phân trang" className="flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        aria-label="Trang trước"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E4E1E0] text-[#5F5D5D] disabled:opacity-40"
      >
        <Icon name="chevron-right" size={14} className="rotate-180" />
      </button>
      {pages.map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-[13px] text-[#5F5D5D]">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? "page" : undefined}
            onClick={() => onChange(p)}
            className={`flex h-9 w-9 items-center justify-center rounded-md text-[13px] font-medium ${
              p === page ? "bg-[#880206] text-white" : "border border-[#E4E1E0] text-[#0C0D0D] hover:border-[#880206]"
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page === total}
        onClick={() => onChange(page + 1)}
        aria-label="Trang sau"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-[#E4E1E0] text-[#5F5D5D] disabled:opacity-40"
      >
        <Icon name="chevron-right" size={14} />
      </button>
    </nav>
  );
}
