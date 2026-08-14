import type { PropertyType } from "@/lib/types";
import { AREA_RANGES, PRICE_RANGES, type RentalFilterState } from "@/lib/rentalFilters";

interface Filter2Props {
  value: RentalFilterState;
  onChange: (patch: Partial<RentalFilterState>) => void;
  onApply?: () => void;
  onReset: () => void;
  locationOptions: string[];
  propertyTypeOptions: PropertyType[];
}

const SELECT_CLASS = "mt-1 w-full rounded-md border border-[#E4E1E0] px-3 py-2.5 text-[13px] text-[#0C0D0D]";

// V2 filter sidebar/drawer content — matches 02_ChoThue_WEB.png's "Bộ lọc
// tìm kiếm" panel. "Số phòng ngủ" is a visual-only checkbox row: no
// authoritative bedroomCount filter field exists (same documented
// limitation as components/public/Filter — see there for the reasoning),
// so it renders for fidelity but never filters real results.
export function Filter2({ value, onChange, onApply, onReset, locationOptions, propertyTypeOptions }: Filter2Props) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#0C0D0D]">Bộ lọc tìm kiếm</h2>
        <button type="button" onClick={onReset} className="text-[12px] font-semibold text-[#880206]">
          Xóa bộ lọc
        </button>
      </div>

      <label className="mt-5 block">
        <span className="text-[13px] font-semibold text-[#0C0D0D]">Khu vực</span>
        <select className={SELECT_CLASS} value={value.location} onChange={(e) => onChange({ location: e.target.value })}>
          <option value="">Chọn khu vực</option>
          {locationOptions.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="mt-5">
        <legend className="text-[13px] font-semibold text-[#0C0D0D]">Loại bất động sản</legend>
        <div className="mt-2 flex flex-col gap-2">
          <label className="flex items-center gap-2 text-[13px] text-[#3A3838]">
            <input
              type="checkbox"
              checked={value.propertyType === ""}
              onChange={() => onChange({ propertyType: "" })}
              className="h-4 w-4 rounded border-[#C9C6C5] text-[#880206] focus:ring-[#880206]"
            />
            Tất cả
          </label>
          {propertyTypeOptions.map((type) => (
            <label key={type} className="flex items-center gap-2 text-[13px] text-[#3A3838]">
              <input
                type="checkbox"
                checked={value.propertyType === type}
                onChange={() => onChange({ propertyType: value.propertyType === type ? "" : (type as PropertyType) })}
                className="h-4 w-4 rounded border-[#C9C6C5] text-[#880206] focus:ring-[#880206]"
              />
              {type}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="mt-5 block">
        <span className="text-[13px] font-semibold text-[#0C0D0D]">Khoảng giá</span>
        <select className={SELECT_CLASS} value={value.priceRange} onChange={(e) => onChange({ priceRange: e.target.value })}>
          <option value="">Tất cả mức giá</option>
          {PRICE_RANGES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-5 block">
        <span className="text-[13px] font-semibold text-[#0C0D0D]">Diện tích</span>
        <select className={SELECT_CLASS} value={value.areaRange} onChange={(e) => onChange({ areaRange: e.target.value })}>
          <option value="">Tất cả diện tích</option>
          {AREA_RANGES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="mt-5">
        <legend className="text-[13px] font-semibold text-[#0C0D0D]">Số phòng ngủ</legend>
        <div className="mt-2 flex flex-col gap-2">
          {["Tất cả", "1 phòng", "2 phòng", "3 phòng", "4 phòng trở lên"].map((label, i) => (
            <label key={label} className="flex items-center gap-2 text-[13px] text-[#3A3838]">
              <input type="checkbox" defaultChecked={i === 0} disabled className="h-4 w-4 rounded border-[#C9C6C5] text-[#880206]" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {onApply && (
        <button
          type="button"
          onClick={onApply}
          className="mt-6 w-full rounded-md bg-[#880206] px-6 py-3 text-[13px] font-semibold uppercase text-white hover:bg-[#750F0D]"
        >
          Áp dụng bộ lọc
        </button>
      )}
    </div>
  );
}
