const FIELDS: { label: string; placeholder: string }[] = [
  { label: "Khu vực", placeholder: "Tất cả khu vực" },
  { label: "Loại BĐS", placeholder: "Căn hộ / Nhà / Mặt bằng" },
  { label: "Khoảng giá", placeholder: "Tất cả mức giá" },
  { label: "Diện tích", placeholder: "Tất cả diện tích" },
  { label: "Số phòng ngủ", placeholder: "Tất cả" },
];

interface FilterProps {
  onApply?: () => void;
  onReset?: () => void;
  empty?: boolean;
}

export function Filter({ onApply, onReset, empty = false }: FilterProps) {
  return (
    <div>
      <h2 className="text-h3 text-ink">Bộ lọc</h2>
      <div className="mt-4 flex flex-col gap-4">
        {FIELDS.map((field) => (
          <label key={field.label} className="flex flex-col gap-1">
            <span className="text-label text-ink">{field.label}</span>
            <select
              className="rounded-md border border-line px-4 py-3 text-body text-muted focus:border-primary focus:outline-none"
              defaultValue=""
            >
              <option value="">{field.placeholder}</option>
            </select>
          </label>
        ))}
      </div>
      <button
        type="button"
        onClick={onApply}
        className="mt-6 w-full rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
      >
        Áp dụng
      </button>
      <button type="button" onClick={onReset} className="mt-3 text-label text-muted underline">
        Xóa bộ lọc
      </button>

      {empty && (
        <div className="mt-6 rounded-md bg-soft p-6">
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
      )}
    </div>
  );
}
