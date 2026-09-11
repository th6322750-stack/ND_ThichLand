interface PaginationProps {
  page: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, total, onChange }: PaginationProps) {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <nav aria-label="Phân trang" className="flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="rounded-md border border-line px-3 py-2 text-body text-ink disabled:opacity-40"
        aria-label="Trang trước"
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-current={p === page ? "page" : undefined}
          onClick={() => onChange(p)}
          className={`rounded-md px-3 py-2 text-body ${
            p === page ? "bg-primary text-surface" : "border border-line text-ink hover:border-primary"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page === total}
        onClick={() => onChange(page + 1)}
        className="rounded-md border border-line px-3 py-2 text-body text-ink disabled:opacity-40"
        aria-label="Trang sau"
      >
        ›
      </button>
    </nav>
  );
}
