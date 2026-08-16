"use client";

import type { PropertyType } from "@/lib/types";
import type { RentalFilterState } from "@/lib/rentalFilters";
import { RangeSlider2, type RangeStop } from "@/components/public-v2/RangeSlider2";

interface Filter2Props {
  value: RentalFilterState;
  onChange: (patch: Partial<RentalFilterState>) => void;
  onApply?: () => void;
  onReset: () => void;
  locationOptions: string[];
  propertyTypeOptions: PropertyType[];
}

const SELECT_CLASS =
  "mt-1 w-full rounded-md border border-[#E4E1E0] px-3 py-[10px] text-[13px] text-[#0C0D0D] wide:h-[50px] wide:px-4 wide:text-[14px]";
// accent-* (native checkbox/radio fill color) is what actually renders the
// master's red checkmark — text-[#880206] alone has no effect on an
// unstyled native checkbox, there's no @tailwindcss/forms plugin in this
// project to repurpose text-color into a checkbox background-image.
const CHECKBOX_CLASS = "h-4 w-4 rounded border-[#C9C6C5] accent-[#880206] focus:ring-[#880206] wide:h-[18px] wide:w-[18px]";

// 02_ChoThue_WEB.png's "Khoảng giá" control: labeled Từ/Đến selects over a
// two-handle slider, both bound to the SAME priceMin/priceMax fields — the
// last stop has no upper value (master shows "Trên 50 triệu"), so it maps
// to priceMax: null (no upper bound) instead of a literal 50_000_000 cap.
const PRICE_STOPS: RangeStop[] = [
  { value: 0, label: "0đ" },
  { value: 5_000_000, label: "5 triệu" },
  { value: 10_000_000, label: "10 triệu" },
  { value: 15_000_000, label: "15 triệu" },
  { value: 20_000_000, label: "20 triệu" },
  { value: 25_000_000, label: "25 triệu" },
  { value: 30_000_000, label: "30 triệu" },
  { value: 40_000_000, label: "40 triệu" },
  { value: 50_000_000, label: "Trên 50 triệu" },
];

// Bound to the real PropertyListing.bedroomCount field (admin-editable, and
// parsed from the sheet where an explicit phrase exists). `value: null` is
// "Tất cả"; every other entry is a MINIMUM, so "4 phòng trở lên" is simply
// the largest minimum — matching how a renter reads the label.
const BEDROOM_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: "Tất cả" },
  { value: 1, label: "1 phòng" },
  { value: 2, label: "2 phòng" },
  { value: 3, label: "3 phòng" },
  { value: 4, label: "4 phòng trở lên" },
];

// 02_ChoThue_WEB.png's "Loại bất động sản" checkboxes show full descriptive
// labels in a fixed order — PropertyType's short internal values ("Căn hộ",
// "Xưởng", "Studio"...) are the real filter/URL-state/data values (used for
// matching listings, unchanged), this is DISPLAY TEXT ONLY.
const PROPERTY_TYPE_ORDER: PropertyType[] = ["Căn hộ", "Nhà", "Văn phòng", "Mặt bằng", "Xưởng", "Studio"];
const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  "Căn hộ": "Căn hộ chung cư",
  "Nhà": "Nhà riêng / Nhà nguyên căn",
  "Văn phòng": "Văn phòng",
  "Mặt bằng": "Mặt bằng kinh doanh",
  "Xưởng": "Kho xưởng / Đất",
  Studio: "Phòng trọ",
};

function priceIndexForMin(min: number | null): number {
  if (min === null) return 0;
  const i = PRICE_STOPS.findIndex((s) => s.value === min);
  return i === -1 ? 0 : i;
}

function priceIndexForMax(max: number | null): number {
  if (max === null) return PRICE_STOPS.length - 1;
  const i = PRICE_STOPS.findIndex((s) => s.value === max);
  return i === -1 ? PRICE_STOPS.length - 1 : i;
}

// V2 filter sidebar/drawer content — matches 02_ChoThue_WEB.png's "Bộ lọc
// tìm kiếm" panel.
//
// "Số phòng ngủ" used to be wired to LOCAL component state only — every
// checkbox in that group looked interactive and never changed a single
// result, because RentalFilterState had no bedroom field at the time. That
// field now exists on PropertyListing (admin-editable, never inferred), so
// the group filters for real like every other control here.
export function Filter2({ value, onChange, onApply, onReset, locationOptions, propertyTypeOptions }: Filter2Props) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#0C0D0D] wide:text-[18px]">Bộ lọc tìm kiếm</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-[12px] font-semibold text-[#880206] transition-colors duration-fast ease-base hover:text-[#750F0D] wide:text-[13px]"
        >
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
          <label className="flex items-center gap-2 text-[13px] text-[#3A3838] wide:text-[14px]">
            <input
              type="checkbox"
              checked={value.propertyType === ""}
              onChange={() => onChange({ propertyType: "" })}
              className={CHECKBOX_CLASS}
            />
            Tất cả
          </label>
          {PROPERTY_TYPE_ORDER.filter((type) => propertyTypeOptions.includes(type)).map((type) => (
            <label key={type} className="flex items-center gap-2 text-[13px] text-[#3A3838] wide:text-[14px]">
              <input
                type="checkbox"
                checked={value.propertyType === type}
                onChange={() => onChange({ propertyType: value.propertyType === type ? "" : type })}
                className={CHECKBOX_CLASS}
              />
              {PROPERTY_TYPE_LABELS[type]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5" role="group" aria-labelledby="filter2-khoang-gia">
        <span id="filter2-khoang-gia" className="text-[13px] font-semibold text-[#0C0D0D]">
          Khoảng giá
        </span>
        <div className="mt-1">
          <RangeSlider2
            stops={PRICE_STOPS}
            fromIndex={priceIndexForMin(value.priceMin)}
            toIndex={priceIndexForMax(value.priceMax)}
            onChange={(fromIndex, toIndex) =>
              onChange({
                priceMin: fromIndex === 0 ? null : PRICE_STOPS[fromIndex].value,
                priceMax: toIndex === PRICE_STOPS.length - 1 ? null : PRICE_STOPS[toIndex].value,
              })
            }
          />
        </div>
      </div>

      <div className="mt-5" role="group" aria-labelledby="filter2-dien-tich">
        <span id="filter2-dien-tich" className="text-[13px] font-semibold text-[#0C0D0D]">
          Diện tích
        </span>
        <div className="mt-1 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-[12px] text-[#5F5D5D]">Từ</span>
            <div className="relative mt-1">
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={value.areaMin ?? ""}
                onChange={(e) => onChange({ areaMin: e.target.value === "" ? null : Number(e.target.value) })}
                className="w-full rounded-md border border-[#E4E1E0] px-3 py-[10px] pr-[36px] text-[13px] text-[#0C0D0D] wide:h-[50px] wide:text-[14px]"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#5F5D5D]">m²</span>
            </div>
          </label>
          <label className="block">
            <span className="block text-[12px] text-[#5F5D5D]">Đến</span>
            <div className="relative mt-1">
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={value.areaMax ?? ""}
                onChange={(e) => onChange({ areaMax: e.target.value === "" ? null : Number(e.target.value) })}
                className="w-full rounded-md border border-[#E4E1E0] px-3 py-[10px] pr-[36px] text-[13px] text-[#0C0D0D] wide:h-[50px] wide:text-[14px]"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#5F5D5D]">m²</span>
            </div>
          </label>
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className="text-[13px] font-semibold text-[#0C0D0D]">Số phòng ngủ</legend>
        <div className="mt-2 flex flex-col gap-2">
          {BEDROOM_OPTIONS.map((option) => (
            <label key={option.label} className="flex items-center gap-2 text-[13px] text-[#3A3838] wide:text-[14px]">
              <input
                type="checkbox"
                checked={value.bedrooms === option.value}
                onChange={() => onChange({ bedrooms: value.bedrooms === option.value ? null : option.value })}
                className={CHECKBOX_CLASS}
              />
              {option.label}
            </label>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-snug text-[#8A8785] wide:text-[12px]">
          Chỉ hiện tin đã có số phòng ngủ — tin chưa cập nhật sẽ không nằm trong kết quả.
        </p>
      </fieldset>

      {onApply && (
        <button
          type="button"
          onClick={onApply}
          className="mt-6 w-full rounded-md bg-[#880206] px-6 py-3 text-[13px] font-semibold uppercase text-white hover:bg-[#750F0D] wide:h-[52px] wide:rounded-[10px] wide:text-[15px]"
        >
          Áp dụng bộ lọc
        </button>
      )}
    </div>
  );
}
