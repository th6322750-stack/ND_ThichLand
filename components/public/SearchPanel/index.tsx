import { Icon } from "@/components/icons";

const FIELDS = [
  { label: "Loại BĐS", placeholder: "Chọn..." },
  { label: "Khu vực", placeholder: "Chọn..." },
  { label: "Khoảng giá", placeholder: "Chọn..." },
  { label: "Diện tích", placeholder: "Chọn..." },
];

export function SearchPanel() {
  return (
    <div className="rounded-md border border-line bg-surface p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <h2 className="text-h3 text-ink">Tìm bất động sản cho thuê</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-5 desktop:items-end">
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
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-button uppercase text-surface hover:bg-primaryHover"
        >
          <Icon name="search" size={16} className="invert" /> Tìm kiếm
        </button>
      </div>
    </div>
  );
}
