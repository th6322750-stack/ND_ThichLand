import type { PropertyType } from "@/lib/types";
import { AREA_RANGES, PRICE_RANGES, type RentalFilterState } from "@/lib/rentalFilters";
import { EmptyRentalResults } from "@/components/public/EmptyRentalResults";

interface FilterProps {
  value: RentalFilterState;
  onChange: (patch: Partial<RentalFilterState>) => void;
  onApply?: () => void;
  onReset: () => void;
  locationOptions: string[];
  propertyTypeOptions: PropertyType[];
  empty?: boolean;
}

const SELECT_BASE = "rounded-md border border-line px-4 py-3 text-body focus:border-primary focus:outline-none";

export function Filter({
  value,
  onChange,
  onApply,
  onReset,
  locationOptions,
  propertyTypeOptions,
  empty = false,
}: FilterProps) {
  return (
    <div>
      <h2 className="text-h3 text-ink">Bộ lọc</h2>
      <div className="mt-4 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-label text-ink">Khu vực</span>
          <select
            className={`${SELECT_BASE} ${value.location ? "text-ink" : "text-muted"}`}
            value={value.location}
            onChange={(e) => onChange({ location: e.target.value })}
          >
            <option value="">Tất cả khu vực</option>
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-label text-ink">Loại BĐS</span>
          <select
            className={`${SELECT_BASE} ${value.propertyType ? "text-ink" : "text-muted"}`}
            value={value.propertyType}
            onChange={(e) => onChange({ propertyType: e.target.value as PropertyType | "" })}
          >
            <option value="">Căn hộ / Nhà / Mặt bằng</option>
            {propertyTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-label text-ink">Khoảng giá</span>
          <select
            className={`${SELECT_BASE} ${value.priceRange ? "text-ink" : "text-muted"}`}
            value={value.priceRange}
            onChange={(e) => onChange({ priceRange: e.target.value })}
          >
            <option value="">Tất cả mức giá</option>
            {PRICE_RANGES.map((range) => (
              <option key={range.id} value={range.id}>
                {range.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-label text-ink">Diện tích</span>
          <select
            className={`${SELECT_BASE} ${value.areaRange ? "text-ink" : "text-muted"}`}
            value={value.areaRange}
            onChange={(e) => onChange({ areaRange: e.target.value })}
          >
            <option value="">Tất cả diện tích</option>
            {AREA_RANGES.map((range) => (
              <option key={range.id} value={range.id}>
                {range.label}
              </option>
            ))}
          </select>
        </label>

        {/* Số phòng ngủ: no authoritative structured source field exists yet
            (see .webby/data-source-map.json). Kept as the approved visual
            control with no other real option than the placeholder — wiring
            it up would mean inferring/fabricating bedroom counts, which is
            explicitly forbidden until a future source-of-truth decision. */}
        <label className="flex flex-col gap-1">
          <span className="text-label text-ink">Số phòng ngủ</span>
          <select className={`${SELECT_BASE} text-muted`} defaultValue="">
            <option value="">Tất cả</option>
          </select>
        </label>
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
        <div className="mt-6">
          <EmptyRentalResults onReset={onReset} />
        </div>
      )}
    </div>
  );
}
