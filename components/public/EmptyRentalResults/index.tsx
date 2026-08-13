interface EmptyRentalResultsProps {
  onReset: () => void;
}

// The one approved empty-result treatment for rental search (from the GĐ4
// Filter panel render) — reused verbatim wherever a "no results" state can
// occur, instead of inventing a second visual language for it.
export function EmptyRentalResults({ onReset }: EmptyRentalResultsProps) {
  return (
    <div className="rounded-md bg-soft p-6">
      <p className="text-h3 text-ink">Không tìm thấy căn phù hợp?</p>
      <p className="mt-2 text-body text-muted">
        Thử mở rộng khoảng giá hoặc khu vực. Không tự hiển thị dữ liệu nội bộ.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 rounded-md border border-primary px-6 py-3 text-button uppercase text-primary hover:bg-surface"
      >
        Đặt lại bộ lọc
      </button>
    </div>
  );
}
